import { Plugin } from '@web/dev-server-core';
import path from 'path';
import { rollup, RollupOptions } from 'rollup';

export interface RollupPluginOptions {
  rollupConfig: RollupOptions;
}

async function bundleEntrypoints(rollupConfig: RollupOptions) {
  const bundle = await rollup(rollupConfig);
  if (Array.isArray(rollupConfig.output)) {
    throw new Error('Multiple outputs not supported.');
  }

  return bundle.generate({
    ...rollupConfig.output,
    chunkFileNames: '__rollup-generated__[name].js',
    assetFileNames: '__rollup-generated__[name][extname]',
  });
}

export function rollupBundlePlugin(pluginOptions: RollupPluginOptions): Plugin {
  const servedFiles = new Map<string, string>();

  return {
    name: 'rollup-bundle',

    async serverStart({ config }) {
      if ((config as any).watch) {
        throw new Error('rollup-bundle plugin does not work with watch mode');
      }

      const bundle = await bundleEntrypoints(pluginOptions.rollupConfig);
      for (const file of bundle.output) {
        let relativeFilePath: string;
        let content: string;

        if (file.type === 'chunk') {
          if (file.isEntry) {
            if (!file.facadeModuleId) {
              throw new Error('Rollup output entry file does not have a facadeModuleId');
            }
            relativeFilePath = path.relative(config.rootDir, file.facadeModuleId);
          } else {
            relativeFilePath = file.fileName;
          }
          content = file.code;
        } else {
          relativeFilePath = file.fileName;
          if (typeof file.source !== 'string') {
            throw new Error('Rollup emitted a file whose content is not a string');
          }
          content = file.source;
        }

        const browserPath = `/${relativeFilePath.split(path.sep).join('/')}`;
        servedFiles.set(browserPath, content);
      }
    },

    serve(context) {
      const content = servedFiles.get(context.path);
      if (content) {
        return content;
      } else if (context.path.includes('__rollup-generated__')) {
        return servedFiles.get(`/${path.basename(context.path)}`);
      }
    },
  };
}
