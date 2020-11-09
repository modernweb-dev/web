import { DevServerCoreConfig, getRequestFilePath, Plugin } from '@web/dev-server-core';
import { mdjsToCsf } from 'storybook-addon-markdown-docs';

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
      if (context.URL.searchParams.get('story') !== 'true') {
        return;
      }

      if (context.path.endsWith('.mdx') || context.path.endsWith('.md')) {
        return 'js';
      }
    },

    async transform(context) {
      if (context.URL.searchParams.get('story') !== 'true') {
        return;
      }

      const filePath = getRequestFilePath(context, serverConfig.rootDir);
      if (context.path.endsWith('.mdx')) {
        context.body = await transformMdxToCsf(context.body, filePath);
      }

      if (context.path.endsWith('.md')) {
        context.body = await mdjsToCsf(context.body, filePath, pluginConfig.type);
      }

      if (storyFilePaths.includes(filePath)) {
        // inject story order, note that MDX and MD and fall through to this as well
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
        storyImports = storyImports.map(i => `${i}?story=true`);

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
