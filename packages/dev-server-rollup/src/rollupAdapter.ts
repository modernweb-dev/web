/* eslint-disable no-control-regex */
import path from 'path';
import whatwgUrl from 'whatwg-url';
import {
  Plugin as WdsPlugin,
  DevServerCoreConfig,
  FSWatcher,
  PluginError,
  PluginSyntaxError,
  Context,
  getRequestFilePath,
} from '@web/dev-server-core';
import {
  queryAll,
  predicates,
  getTextContent,
  setTextContent,
} from '@web/dev-server-core/dist/dom5';
import { parse as parseHtml, serialize as serializeHtml } from 'parse5';
import { CustomPluginOptions, Plugin as RollupPlugin, TransformPluginContext } from 'rollup';
import { InputOptions } from 'rollup';
import { red, cyanBright } from 'chalk';

import { toBrowserPath, isAbsoluteFilePath, isOutsideRootDir } from './utils';
import { createRollupPluginContextAdapter } from './createRollupPluginContextAdapter';
import { createRollupPluginContexts, RollupPluginContexts } from './createRollupPluginContexts';

const NULL_BYTE_PARAM = 'web-dev-server-rollup-null-byte';
const VIRTUAL_FILE_PREFIX = '/__web-dev-server__/rollup';
const WDS_FILE_PREFIX = '/__web-dev-server__';

/**
 * Wraps rollup error in a custom error for web dev server.
 */
function wrapRollupError(filePath: string, context: Context, error: any) {
  if (typeof error == null || typeof error !== 'object') {
    return error;
  }

  if (typeof error?.loc?.line === 'number' && typeof error?.loc?.column === 'number') {
    return new PluginSyntaxError(
      // replace file path in error message since it will be reported be the dev server
      error.message.replace(new RegExp(`(\\s*in\\s*)?(${filePath})`), ''),
      filePath,
      context.body,
      error.loc.line as number,
      error.loc.column as number,
    );
  }
  return error;
}

export interface RollupAdapterOptions {
  throwOnUnresolvedImport?: boolean;
}

export function rollupAdapter(
  rollupPlugin: RollupPlugin,
  rollupInputOptions: Partial<InputOptions> = {},
  adapterOptions: RollupAdapterOptions = {},
): WdsPlugin {
  if (typeof rollupPlugin !== 'object') {
    throw new Error('rollupAdapter should be called with a rollup plugin object.');
  }

  const transformedFiles = new Set();
  const pluginMetaPerModule = new Map<string, CustomPluginOptions>();
  let rollupPluginContexts: RollupPluginContexts;
  let fileWatcher: FSWatcher;
  let config: DevServerCoreConfig;
  let rootDir: string;

  function savePluginMeta(
    id: string,
    { meta }: { meta?: CustomPluginOptions | null | undefined } = {},
  ) {
    if (!meta) {
      return;
    }
    const previousMeta = pluginMetaPerModule.get(id);
    pluginMetaPerModule.set(id, { ...previousMeta, ...meta });
  }

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

    async resolveImport({ source, context, code, column, line }) {
      if (context.response.is('html') && source.startsWith('�')) {
        // when serving HTML a null byte gets parsed as an unknown character
        // we remap it to a null byte here so that it is handled properly downstream
        // this isn't a perfect solution
        source = source.replace('�', '\0');
      }

      // if we just transformed this file and the import is an absolute file path
      // we need to rewrite it to a browser path
      const injectedFilePath = path.normalize(source).startsWith(rootDir);
      if (!injectedFilePath && !rollupPlugin.resolveId) {
        return;
      }

      if (!injectedFilePath && !path.isAbsolute(source) && whatwgUrl.parseURL(source) != null) {
        // don't resolve relative and valid urls
        return source;
      }

      const filePath = getRequestFilePath(context.url, rootDir);

      try {
        const rollupPluginContext = createRollupPluginContextAdapter(
          rollupPluginContexts.pluginContext,
          wdsPlugin,
          config,
          fileWatcher,
          context,
          pluginMetaPerModule,
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

        let result = await rollupPlugin.resolveId?.call(
          rollupPluginContext,
          resolvableImport,
          filePath,
          {},
        );

        if (!result && injectedFilePath) {
          // the import is a file path but it was not resolved by this plugin
          // we do assign it here so that it will be converted to a browser path
          result = resolvableImport;
        }

        let resolvedImportPath: string | undefined = undefined;
        if (typeof result === 'string') {
          resolvedImportPath = result;
        } else if (typeof result === 'object' && typeof result?.id === 'string') {
          resolvedImportPath = result.id;
          savePluginMeta(result.id, result);
        }

        if (!resolvedImportPath) {
          if (
            !['/', './', '../'].some(prefix => resolvableImport.startsWith(prefix)) &&
            adapterOptions.throwOnUnresolvedImport
          ) {
            const errorMessage = red(`Could not resolve import ${cyanBright(`"${source}"`)}.`);
            if (
              typeof code === 'string' &&
              typeof column === 'number' &&
              typeof line === 'number'
            ) {
              throw new PluginSyntaxError(errorMessage, filePath, code, column, line);
            } else {
              throw new PluginError(errorMessage);
            }
          }
          return undefined;
        }

        // if the resolved import includes a null byte (\0) there is some special logic
        // these often are not valid file paths, so the browser cannot request them.
        // we rewrite them to a special URL which we deconstruct later when we load the file
        if (resolvedImportPath.includes('\0')) {
          const filename = path.basename(
            resolvedImportPath.replace(/\0*/g, '').split('?')[0].split('#')[0],
          );
          const urlParam = encodeURIComponent(resolvedImportPath);
          return `${VIRTUAL_FILE_PREFIX}/${filename}?${NULL_BYTE_PARAM}=${urlParam}`;
        }

        // some plugins don't return a file path, so we just return it as is
        if (!isAbsoluteFilePath(resolvedImportPath)) {
          return `${resolvedImportPath}`;
        }

        // file already resolved outsided root dir
        if (isOutsideRootDir(resolvedImportPath)) {
          return `${resolvedImportPath}`;
        }

        const normalizedPath = path.normalize(resolvedImportPath);
        if (!normalizedPath.startsWith(rootDir)) {
          const relativePath = path.relative(rootDir, normalizedPath);
          const dirUp = `..${path.sep}`;
          const lastDirUpIndex = relativePath.lastIndexOf(dirUp) + 3;
          const dirUpStrings = relativePath.substring(0, lastDirUpIndex).split(path.sep);
          if (dirUpStrings.length === 0 || dirUpStrings.some(str => !['..', ''].includes(str))) {
            // we expect the relative part to consist of only ../ or ..\\
            const errorMessage =
              red(`\n\nResolved ${cyanBright(source)} to ${cyanBright(resolvedImportPath)}.\n\n`) +
              red(
                'This path could not be converted to a browser path. Please file an issue with a reproduction.',
              );
            if (
              typeof code === 'string' &&
              typeof column === 'number' &&
              typeof line === 'number'
            ) {
              throw new PluginSyntaxError(errorMessage, filePath, code, column, line);
            } else {
              throw new PluginError(errorMessage);
            }
          }

          const importPath = toBrowserPath(relativePath.substring(lastDirUpIndex));
          resolvedImportPath = `/__wds-outside-root__/${dirUpStrings.length - 1}/${importPath}`;
        } else {
          const resolveRelativeTo = path.extname(filePath) ? path.dirname(filePath) : filePath;
          const relativeImportFilePath = path.relative(resolveRelativeTo, resolvedImportPath);
          resolvedImportPath = `./${toBrowserPath(relativeImportFilePath)}`;
        }

        return `${resolvedImportPath}${importSuffix}`;
      } catch (error) {
        throw wrapRollupError(filePath, context, error);
      }
    },

    async serve(context) {
      if (!rollupPlugin.load) {
        return;
      }

      if (
        context.path.startsWith(WDS_FILE_PREFIX) &&
        !context.path.startsWith(VIRTUAL_FILE_PREFIX)
      ) {
        return;
      }

      let filePath;
      if (
        context.path.startsWith(VIRTUAL_FILE_PREFIX) &&
        context.URL.searchParams.has(NULL_BYTE_PARAM)
      ) {
        // if this was a special URL constructed in resolveImport to handle null bytes,
        // the file path is stored in the search paramter
        filePath = context.URL.searchParams.get(NULL_BYTE_PARAM) as string;
      } else {
        filePath = path.join(rootDir, context.path);
      }

      try {
        const rollupPluginContext = createRollupPluginContextAdapter(
          rollupPluginContexts.pluginContext,
          wdsPlugin,
          config,
          fileWatcher,
          context,
          pluginMetaPerModule,
        );

        const result = await rollupPlugin.load?.call(rollupPluginContext, filePath);

        if (typeof result === 'string') {
          return { body: result, type: 'js' };
        }
        if (typeof result?.code === 'string') {
          savePluginMeta(filePath, result);
          return { body: result.code, type: 'js' };
        }
      } catch (error) {
        throw wrapRollupError(filePath, context, error);
      }

      return undefined;
    },

    async transform(context) {
      if (!rollupPlugin.transform) {
        return;
      }

      if (context.path.startsWith(WDS_FILE_PREFIX)) {
        return;
      }

      if (context.response.is('js')) {
        const filePath = path.join(rootDir, context.path);
        try {
          const rollupPluginContext = createRollupPluginContextAdapter(
            rollupPluginContexts.transformPluginContext,
            wdsPlugin,
            config,
            fileWatcher,
            context,
            pluginMetaPerModule,
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
            savePluginMeta(filePath, result);
            transformedCode = result.code;
          }

          if (transformedCode) {
            transformedFiles.add(context.path);
            return transformedCode;
          }

          return;
        } catch (error) {
          throw wrapRollupError(filePath, context, error);
        }
      }

      if (context.response.is('html')) {
        const documentAst = parseHtml(context.body);
        const inlineScripts = queryAll(
          documentAst,
          predicates.AND(
            predicates.hasTagName('script'),
            predicates.NOT(predicates.hasAttr('src')),
          ),
        );

        const filePath = getRequestFilePath(context.url, rootDir);
        let transformed = false;
        try {
          for (const node of inlineScripts) {
            const code = getTextContent(node);

            const rollupPluginContext = createRollupPluginContextAdapter(
              rollupPluginContexts.transformPluginContext,
              wdsPlugin,
              config,
              fileWatcher,
              context,
              pluginMetaPerModule,
            );

            const result = await rollupPlugin.transform?.call(
              rollupPluginContext as TransformPluginContext,
              code,
              filePath,
            );

            let transformedCode: string | undefined = undefined;
            if (typeof result === 'string') {
              transformedCode = result;
            }

            if (typeof result === 'object' && typeof result?.code === 'string') {
              savePluginMeta(filePath, result);
              transformedCode = result.code;
            }

            if (transformedCode) {
              transformedFiles.add(context.path);
              setTextContent(node, transformedCode);
              transformed = true;
            }
          }

          if (transformed) {
            return serializeHtml(documentAst);
          }
        } catch (error) {
          throw wrapRollupError(filePath, context, error);
        }
      }
    },

    fileParsed(context) {
      if (!rollupPlugin.moduleParsed) {
        return;
      }

      const rollupPluginContext = createRollupPluginContextAdapter(
        rollupPluginContexts.transformPluginContext,
        wdsPlugin,
        config,
        fileWatcher,
        context,
        pluginMetaPerModule,
      );
      const filePath = getRequestFilePath(context.url, rootDir);
      const info = rollupPluginContext.getModuleInfo(filePath);
      if (!info) throw new Error(`Missing info for module ${filePath}`);
      rollupPlugin.moduleParsed?.call(rollupPluginContext as TransformPluginContext, info);
    },
  };

  return wdsPlugin;
}
