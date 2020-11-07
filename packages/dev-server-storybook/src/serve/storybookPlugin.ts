import { DevServerCoreConfig, getRequestFilePath, Plugin } from '@web/dev-server-core';

import { StorybookPluginConfig } from '../shared/config/StorybookPluginConfig';
import { createManagerHtml } from '../shared/html/createManagerHtml';
import { createPreviewHtml } from '../shared/html/createPreviewHtml';
import { readStorybookConfig } from '../shared/config/readStorybookConfig';
import { validatePluginConfig } from '../shared/config/validatePluginConfig';
import { findStories } from '../shared/stories/findStories';
import { transformMdxToCsf } from '../shared/mdx/transformMdxToCsf';
import { injectExportsOrder } from '../shared/stories/injectExportsOrder';

export function storybookPlugin(pluginConfig: StorybookPluginConfig): Plugin {
  validatePluginConfig(pluginConfig);

  const storybookConfig = readStorybookConfig(pluginConfig);
  let serverConfig: DevServerCoreConfig;
  let storyImports: string[] = [];
  let storyFilePaths: string[] = [];

  return {
    name: 'storybook',

    serverStart(args) {
      serverConfig = args.config;
    },

    resolveMimeType(context) {
      if (context.path.endsWith('.mdx')) {
        return 'js';
      }
    },

    async transform(context) {
      const filePath = getRequestFilePath(context, serverConfig.rootDir);
      if (context.path.endsWith('.mdx')) {
        context.body = await transformMdxToCsf(context.body, filePath);
        // fall through to below to inject exports order as well
      }

      if (storyFilePaths.includes(filePath)) {
        context.body = await injectExportsOrder(context.body, filePath);
      }
    },

    async serve(context) {
      if (context.path === '/') {
        return { type: 'html', body: createManagerHtml(storybookConfig, serverConfig.rootDir) };
      }

      if (context.path === '/iframe.html') {
        ({ storyImports, storyFilePaths } = await findStories(
          serverConfig.rootDir,
          storybookConfig.mainJsPath,
          storybookConfig.mainJs.stories,
        ));

        return {
          type: 'html',
          body: createPreviewHtml(
            pluginConfig,
            storybookConfig,
            serverConfig.rootDir,
            storyImports,
          ),
        };
      }
    },
  };
}
