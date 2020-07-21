import { startService, Service, Loader, Message } from 'esbuild';
import path from 'path';
import { Plugin, PluginSyntaxError, Logger, DevServerCoreConfig } from '@web/dev-server-core';
import { URL, pathToFileURL, fileURLToPath } from 'url';
import { getEsbuildLoader } from './getEsbuildLoader';
import { getEsbuildTarget } from './getEsbuildTarget';

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

  return {
    name: 'esbuild',

    async serverStart(args) {
      ({ config, logger } = args);
      service = await startService();

      ['exit', 'SIGINT'].forEach(event => {
        process.on(event, () => {
          service?.stop();
        });
      });
    },

    resolveMimeType(context) {
      if (handledExtensions.some(ext => context.path.endsWith(ext))) {
        return 'js';
      }
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

export default esbuildPlugin;
