import { DevServerCoreConfig, Plugin } from '@web/dev-server-core';

import { StorybookPluginConfig } from '../shared/StorybookPluginConfig';
import { createManagerHtml } from '../shared/createManagerHtml';
import { createPreviewHtml } from '../shared/createPreviewHtml';
import { readStorybookConfig } from '../shared/readStorybookConfig';
import { validatePluginConfig } from '../shared/validatePluginConfig';
import { findStories } from '../shared/findStories';

export function storybookPlugin(pluginConfig: StorybookPluginConfig): Plugin {
  validatePluginConfig(pluginConfig);

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
          body: createPreviewHtml(config.rootDir, pluginConfig, previewJsPath, storyImports),
        };
      }
    },
  };
}
