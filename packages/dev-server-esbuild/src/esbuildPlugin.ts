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
import { getEsbuildTarget } from './getEsbuildTarget';

const exitProcessEvents = ['exit', 'SIGINT'];

export interface EsBuildPluginArgs {
  target?: string;
  js?: boolean;
  ts?: boolean;
  json?: boolean;
  jsx?: boolean;
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
  const loaders: Record<string, Loader> = {};
  for (const [key, value] of Object.entries(args.loaders ?? {})) {
    loaders[key.startsWith('.') ? key : `.${key}`] = value;
  }
  if (args.ts) {
    loaders['.ts'] = 'ts';
  }
  if (args.jsx) {
    loaders['.jsx'] = 'jsx';
  }
  if (args.tsx) {
    loaders['.tsx'] = 'tsx';
  }
  if (args.json) {
    loaders['.json'] = 'json';
  }
  if (args.js) {
    loaders['.json'] = 'json';
  }
  if (typeof args.target === 'string') {
    loaders['.js'] = 'js';
  }
  const handledExtensions = Object.keys(loaders);
  const tsFileExtensions: string[] = [];
  for (const [extension, loader] of Object.entries(loaders)) {
    if (loader === 'ts' || loader === 'tsx') {
      tsFileExtensions.push(extension);
    }
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
      const fileExtension = path.posix.extname(context.path);
      if (handledExtensions.includes(fileExtension)) {
        return 'js';
      }
    },

    async resolveImport({ source, context }) {
      const fileExtension = path.posix.extname(context.path);
      if (!tsFileExtensions.includes(fileExtension)) {
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
      const fileExtension = path.posix.extname(context.path);
      const loader = loaders[fileExtension];
      // the transformed files are cached per esbuild transform target
      return loader ? getEsbuildTarget(esBuildTarget, context.headers['user-agent']) : undefined;
    },

    async transform(context) {
      const fileExtension = path.posix.extname(context.path);
      const loader = loaders[fileExtension];
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
