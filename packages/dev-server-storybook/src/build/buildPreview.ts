import { createRollupConfig } from './createRollupConfig';
import { buildAndWrite } from './buildAndWrite';
import { createPreviewHtml } from '../shared/createPreviewHtml';
import { findStories } from '../shared/findStories';
import { StorybookPluginConfig } from '../shared/StorybookPluginConfig';
import { RollupMainJs } from './RollupMainJs';

interface BuildPreviewParams {
  pluginConfig: StorybookPluginConfig;
  outputDir: string;
  rootDir: string;
  mainJs: RollupMainJs;
  mainJsPath: string;
  previewJsPath: string;
}

export async function buildPreview(params: BuildPreviewParams) {
  const { pluginConfig, outputDir, rootDir, mainJs, mainJsPath, previewJsPath } = params;
  const storyImports = await findStories(rootDir, mainJsPath, mainJs.stories);
  const previewHtml = createPreviewHtml(rootDir, pluginConfig, previewJsPath, storyImports);

  let config = createRollupConfig({
    outputDir,
    indexFilename: 'iframe.html',
    indexHtmlString: previewHtml,
  });

  // config.plugins.unshift(
  //   transformMdPlugin(storyIds, { setupMdjsPlugins }),
  //   injectOrderedExportsPlugin(storyIds),
  // );

  if (mainJs.rollupConfigDecorator) {
    config = (await mainJs.rollupConfigDecorator(config)) ?? config;
  }

  await buildAndWrite(config);
}
