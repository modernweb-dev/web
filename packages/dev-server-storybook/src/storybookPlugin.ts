import { DevServerCoreConfig, Plugin } from '@web/dev-server-core';

import { StorybookPluginConfig } from './StorybookPluginConfig';
import { createError } from './utils';
import { createManagerHtml } from './html/createManagerHtml';
import { createPreviewHtml } from './html/createPreviewHtml';
import { findStories } from './findStories';
import { readStorybookConfig } from './readStorybookConfig';

const types = ['preact', 'web-components'];

export function storybookPlugin(pluginConfig: StorybookPluginConfig): Plugin {
  if (typeof pluginConfig.type !== 'string') {
    throw createError('Missing project type in config.');
  }

  if (!types.includes(pluginConfig.type)) {
    throw createError(`Invalid project type ${pluginConfig.type}, supported types: ${types}`);
  }

  const { mainJs, mainJsPath, previewJsPath } = readStorybookConfig(pluginConfig);
  let config: DevServerCoreConfig;

  return {
    name: 'storybook',

    serverStart(args) {
      config = args.config;
    },

    async serve(context) {
      if (context.path === '/') {
        return { type: 'html', body: createManagerHtml(mainJs) };
      }

      if (context.path === '/iframe.html') {
        const storyImports = await findStories(config.rootDir, mainJsPath, mainJs.stories);
        return {
          type: 'html',
          body: createPreviewHtml(config, pluginConfig, previewJsPath, storyImports),
        };
      }
    },
  };
}
