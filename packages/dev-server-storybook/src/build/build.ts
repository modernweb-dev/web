import { readStorybookConfig } from '../shared/config/readStorybookConfig.js';
import { validatePluginConfig } from '../shared/config/validatePluginConfig.js';

import { createRollupConfig } from './rollup/createRollupConfig.js';
import { buildAndWrite } from './rollup/buildAndWrite.js';
import { createManagerHtml } from '../shared/html/createManagerHtml.js';
import { createPreviewHtml } from '../shared/html/createPreviewHtml.js';
import { findStories } from '../shared/stories/findStories.js';
import { StorybookPluginConfig } from '../shared/config/StorybookPluginConfig.js';
import { StorybookConfig } from '../shared/config/StorybookConfig.js';

interface BuildPreviewParams {
  type: string;
  storybookConfig: StorybookConfig;
  pluginConfig: StorybookPluginConfig;
  outputDir: string;
  rootDir: string;
}

async function buildPreview(params: BuildPreviewParams) {
  const { type, storybookConfig, pluginConfig, outputDir, rootDir } = params;
  const { storyImports, storyFilePaths } = await findStories(
    rootDir,
    storybookConfig.mainJsPath,
    storybookConfig.mainJs.stories,
  );
  const previewHtml = createPreviewHtml(pluginConfig, storybookConfig, rootDir, storyImports);

  let config = createRollupConfig({
    type,
    outputDir,
    indexFilename: 'iframe.html',
    indexHtmlString: previewHtml,
    storyFilePaths,
  });

  if (storybookConfig.mainJs.rollupConfig) {
    config = (await storybookConfig.mainJs.rollupConfig(config)) ?? config;
  }

  await buildAndWrite(config);
}

interface BuildmanagerParams {
  type: string;
  storybookConfig: StorybookConfig;
  outputDir: string;
  rootDir: string;
}

async function buildManager(params: BuildmanagerParams) {
  const managerHtml = createManagerHtml(params.storybookConfig, params.rootDir);
  const config = createRollupConfig({
    type: params.type,
    outputDir: params.outputDir,
    indexFilename: 'index.html',
    indexHtmlString: managerHtml,
  });

  await buildAndWrite(config);
}

export interface BuildParams {
  type: 'web-components' | 'preact';
  outputDir: string;
  configDir: string;
}

export async function build(params: BuildParams) {
  const { type, outputDir } = params;
  const rootDir = process.cwd();
  validatePluginConfig(params);

  const storybookConfig = await readStorybookConfig(params);
  await buildManager({ type, outputDir, storybookConfig, rootDir });
  await buildPreview({ type, storybookConfig, pluginConfig: params, outputDir, rootDir });
}
