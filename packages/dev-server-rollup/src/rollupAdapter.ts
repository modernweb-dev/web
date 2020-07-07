/* eslint-disable no-control-regex */
import path from 'path';
import whatwgUrl from 'whatwg-url';
import { Plugin as WdsPlugin, DevServerCoreConfig, FSWatcher } from '@web/dev-server-core';
import { URL, pathToFileURL, fileURLToPath } from 'url';
import { Plugin as RollupPlugin, TransformPluginContext } from 'rollup';
import { InputOptions } from 'rollup';

import { toBrowserPath } from './utils';
import { createRollupPluginContextAdapter } from './createRollupPluginContextAdapter';
import { createRollupPluginContexts, RollupPluginContexts } from './createRollupPluginContexts';

const NULL_BYTE_PARAM = 'web-dev-server-rollup-null-byte';
const VIRTUAL_FILE_PREFIX = '/__web-dev-server__';

function resolveFilePath(rootDir: string, path: string) {
  const fileUrl = new URL(`.${path}`, `${pathToFileURL(rootDir)}/`);
  return fileURLToPath(fileUrl);
}

export function rollupAdapter(
  rollupPlugin: RollupPlugin,
  rollupInputOptions: Partial<InputOptions> = {},
): WdsPlugin {
  const transformedFiles = new Set();
  let rollupPluginContexts: RollupPluginContexts;
  let fileWatcher: FSWatcher;
  let config: DevServerCoreConfig;
  let rootDir: string;

  const wdsPlugin: WdsPlugin = {
    name: rollupPlugin.name,
    async serverStart(args) {
      ({ fileWatcher, config } = args);
      ({ rootDir } = config);
      rollupPluginContexts = await createRollupPluginContexts(rollupInputOptions);

      // call the options and buildStart hooks
      rollupPlugin.options?.call(rollupPluginContexts.minimalPluginContext, rollupInputOptions) ??
        rollupInputOptions;
      rollupPlugin.buildStart?.call(
        rollupPluginContexts.pluginContext,
        rollupPluginContexts.normalizedInputOptions,
      );
    },

    async resolveImport({ source, context }) {
      // if we just transformed this file and the import is an absolute file path
      // we need to rewrite it to a browser path
      const injectedFilePath = transformedFiles.has(context.path) && source.startsWith(rootDir);

      if (!injectedFilePath && !rollupPlugin.resolveId) {
        return;
      }

      if (whatwgUrl.parseURL(source) != null) {
        // don't resolve valid urls
        return source;
      }

      const requestedFile = context.path.endsWith('/') ? `${context.path}index.html` : context.path;
      const filePath = resolveFilePath(rootDir, requestedFile);

      const rollupPluginContext = createRollupPluginContextAdapter(
        rollupPluginContexts.pluginContext,
        wdsPlugin,
        config,
        fileWatcher,
        context,
      );

      let resolvableImport = source;
      let importSuffix = '';
      // we have to special case node-resolve because it doesn't support resolving
      // with hash/params at the moment
      if (rollupPlugin.name === 'node-resolve') {
        const [withoutHash, hash] = source.split('#');
        const [importPath, params] = withoutHash.split('?');
        importSuffix = `${params ? `?${params}` : ''}${hash ? `#${hash}` : ''}`;
        resolvableImport = importPath;
      }

      // if the import was already a fully resolved file path, it was probably injected by a plugin.
      // in that case use that instead of resolving it through a plugin hook. this puts the resolved file
      // path through the regular logic to turn it into a relative browser import
      // otherwise call the resolveID hook on the plugin
      const result = injectedFilePath
        ? resolvableImport
        : await rollupPlugin.resolveId?.call(rollupPluginContext, resolvableImport, filePath);

      let resolvedImportFilePath: string | undefined = undefined;
      if (typeof result === 'string') {
        resolvedImportFilePath = result;
      } else if (typeof result === 'object' && typeof result?.id === 'string') {
        resolvedImportFilePath = result.id;
      }

      if (!resolvedImportFilePath) {
        return undefined;
      }

      const hasNullByte = resolvedImportFilePath.includes('\0');
      const withoutNullByte = hasNullByte
        ? resolvedImportFilePath.replace(new RegExp('\0', 'g'), '')
        : resolvedImportFilePath;

      if (withoutNullByte.startsWith(rootDir)) {
        const resolveRelativeTo = path.extname(filePath) ? path.dirname(filePath) : filePath;
        const relativeImportFilePath = path.relative(resolveRelativeTo, withoutNullByte);
        const resolvedImportPath = `${toBrowserPath(relativeImportFilePath)}`;

        const prefixedImportPath =
          resolvedImportPath.startsWith('/') || resolvedImportPath.startsWith('.')
            ? `${resolvedImportPath}${importSuffix}`
            : `./${resolvedImportPath}${importSuffix}`;

        if (!hasNullByte) {
          return prefixedImportPath;
        }

        const suffix = `${NULL_BYTE_PARAM}=${encodeURIComponent(resolvedImportFilePath)}`;
        if (prefixedImportPath.includes('?')) {
          return `${prefixedImportPath}&${suffix}`;
        }
        return `${prefixedImportPath}?${suffix}`;
      }

      // if the resolved import includes a null byte (\0) there is some special logic
      // these often are not valid file paths, so the browser cannot request them.
      // we rewrite them to a special URL which we deconstruct later when we load the file
      if (resolvedImportFilePath.includes('\0')) {
        return `${VIRTUAL_FILE_PREFIX}/?${NULL_BYTE_PARAM}=${encodeURIComponent(
          resolvedImportFilePath,
        )}`;
      }

      return `${resolvedImportFilePath}${importSuffix}`;
    },

    async serve(context) {
      if (!rollupPlugin.load) {
        return;
      }

      let filePath;
      if (context.URL.searchParams.has(NULL_BYTE_PARAM)) {
        // if this was a special URL constructed in resolveImport to handle null bytes,
        // the file path is stored in the search paramter
        filePath = context.URL.searchParams.get(NULL_BYTE_PARAM) as string;
      } else {
        filePath = resolveFilePath(rootDir, context.path);
      }

      const rollupPluginContext = createRollupPluginContextAdapter(
        rollupPluginContexts.pluginContext,
        wdsPlugin,
        config,
        fileWatcher,
        context,
      );

      const result = await rollupPlugin.load?.call(rollupPluginContext, filePath);

      if (typeof result === 'string') {
        return { body: result, type: 'js' };
      }
      if (typeof result?.code === 'string') {
        return { body: result.code, type: 'js' };
      }

      return undefined;
    },

    async transform(context) {
      if (!rollupPlugin.transform) {
        return;
      }

      if (context.response.is('js')) {
        const filePath = resolveFilePath(rootDir, context.path);
        const rollupPluginContext = createRollupPluginContextAdapter(
          rollupPluginContexts.transformPluginContext,
          wdsPlugin,
          config,
          fileWatcher,
          context,
        );

        const result = await rollupPlugin.transform?.call(
          rollupPluginContext as TransformPluginContext,
          context.body,
          filePath,
        );

        let transformedCode: string | undefined = undefined;
        if (typeof result === 'string') {
          transformedCode = result;
        }

        if (typeof result === 'object' && typeof result?.code === 'string') {
          transformedCode = result.code;
        }

        if (transformedCode) {
          transformedFiles.add(context.path);
          return transformedCode;
        }

        return;
      }
    },
  };

  return wdsPlugin;
}
