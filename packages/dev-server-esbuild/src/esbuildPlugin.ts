import { startService, Service, Loader, Message } from 'esbuild';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import {
  Plugin,
  PluginSyntaxError,
  Logger,
  DevServerCoreConfig,
  getRequestFilePath,
} from '@web/dev-server-core';
import { URL, pathToFileURL, fileURLToPath } from 'url';
import { getEsbuildLoader } from './getEsbuildLoader';
import { getEsbuildTarget } from './getEsbuildTarget';

const exitProcessEvents = ['exit', 'SIGINT'];

export interface EsBuildPluginArgs {
  target?: string;
  js?: boolean;
  jsx?: boolean;
  ts?: boolean;
  tsx?: boolean;
  jsxFactory?: string;
  jsxFragment?: string;
  loaders?: Record<string, Loader>;
  define?: { [key: string]: string };
}

async function fileExists(path: string) {
  try {
    await promisify(fs.access)(path);
    return true;
  } catch {
    return false;
  }
}

export function esbuildPlugin(args: EsBuildPluginArgs): Plugin {
  const esBuildTarget = args.target ?? 'auto';
  const handledExtensions = args.loaders ? Object.keys(args.loaders).map(e => `.${e}`) : [];
  if (args.ts) {
    handledExtensions.push('.ts');
  }
  if (args.jsx) {
    handledExtensions.push('.jsx');
  }
  if (args.tsx) {
    handledExtensions.push('.tsx');
  }

  let config: DevServerCoreConfig;
  let logger: Logger;
  let service: Service;

  function onProcessKilled() {
    service?.stop();
  }

  return {
    name: 'esbuild',

    async serverStart(args) {
      ({ config, logger } = args);
      service = await startService();

      for (const event of exitProcessEvents) {
        process.on(event, onProcessKilled);
      }
    },

    serverStop() {
      service?.stop();

      for (const event of exitProcessEvents) {
        process.off(event, onProcessKilled);
      }
    },

    resolveMimeType(context) {
      if (handledExtensions.some(ext => context.path.endsWith(ext))) {
        return 'js';
      }
    },

    async resolveImport({ source, context }) {
      if (!((args.ts || args.tsx) && ['.tsx', '.ts'].some(ext => context.path.endsWith(ext)))) {
        // only handle typescript files
        return;
      }

      if (!source.endsWith('.js') || !source.startsWith('.')) {
        // only handle relative imports
        return;
      }

      // a TS file imported a .js file relatively, but they might intend to import a .ts file instead
      // check if the .ts file exists, and rewrite it in that case
      const filePath = getRequestFilePath(context, config.rootDir);
      const fileDir = path.dirname(filePath);
      const importAsTs = source.substring(0, source.length - 3) + '.ts';
      const importedTsFilePath = path.join(fileDir, importAsTs);
      if (!(await fileExists(importedTsFilePath))) {
        return;
      }
      return importAsTs;
    },

    transformCacheKey(context) {
      // the transformed files are cached per esbuild transform target
      return getEsbuildLoader(context, args)
        ? getEsbuildTarget(esBuildTarget, context.headers['user-agent'])
        : undefined;
    },

    async transform(context) {
      const loader = getEsbuildLoader(context, args);
      if (!loader) {
        // we are not handling this file
        return;
      }

      const target = getEsbuildTarget(esBuildTarget, context.headers['user-agent']);
      if (target === 'esnext' && loader === 'js') {
        // no need run esbuild, this probably happens when target is auto and
        return;
      }

      const filePath = fileURLToPath(
        new URL(`.${context.path}`, `${pathToFileURL(config.rootDir)}/`),
      );

      try {
        const { js, warnings } = await service.transform(context.body, {
          sourcefile: filePath,
          sourcemap: 'inline',
          loader,
          target,
          // use strict class fields when not compiling TS
          strict: ['ts', 'tsx'].includes(loader) ? [] : ['class-fields'],
          jsxFactory: args.jsxFactory,
          jsxFragment: args.jsxFragment,
        });

        if (warnings) {
          const relativePath = path.relative(process.cwd(), filePath);
          for (const warning of warnings) {
            logger.warn(`Warning while transforming ${relativePath}: ${warning.text}`);
          }
        }

        return { body: js };
      } catch (e) {
        if (Array.isArray(e.errors)) {
          const msg = e.errors[0] as Message;

          if (msg.location) {
            throw new PluginSyntaxError(
              msg.text,
              filePath,
              context.body,
              msg.location.line,
              msg.location.column,
            );
          }

          throw new Error(msg.text);
        }

        throw e;
      }
    },
  };
}
