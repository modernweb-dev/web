import { readStorybookConfig } from '../shared/config/readStorybookConfig';
import { validatePluginConfig } from '../shared/config/validatePluginConfig';

import { createRollupConfig } from './rollup/createRollupConfig';
import { buildAndWrite } from './rollup/buildAndWrite';
import { MainJs } from '../shared/config/readStorybookConfig';
import { createManagerHtml } from '../shared/html/createManagerHtml';
import { createPreviewHtml } from '../shared/html/createPreviewHtml';
import { findStories } from '../shared/stories/findStories';
import { StorybookPluginConfig } from '../shared/config/StorybookPluginConfig';
import { RollupMainJs } from './RollupMainJs';

interface BuildPreviewParams {
  pluginConfig: StorybookPluginConfig;
  outputDir: string;
  rootDir: string;
  mainJs: RollupMainJs;
  mainJsPath: string;
  previewJsPath: string;
}

async function buildPreview(params: BuildPreviewParams) {
  const { pluginConfig, outputDir, rootDir, mainJs, mainJsPath, previewJsPath } = params;
  const { storyImports, storyFilePaths } = await findStories(rootDir, mainJsPath, mainJs.stories);
  const previewHtml = createPreviewHtml(rootDir, pluginConfig, previewJsPath, storyImports);

  let config = createRollupConfig({
    outputDir,
    indexFilename: 'iframe.html',
    indexHtmlString: previewHtml,
    storyFilePaths,
  });

  console.log('main.js', mainJs);
  if (mainJs.rollupConfig) {
    config = (await mainJs.rollupConfig(config)) ?? config;
  }

  await buildAndWrite(config);
}

interface BuildmanagerParams {
  outputDir: string;
  mainJs: MainJs;
}

async function buildManager(params: BuildmanagerParams) {
  const managerHtml = createManagerHtml(params.mainJs);
  const config = createRollupConfig({
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
  const { outputDir } = params;
  validatePluginConfig(params);

  const { mainJs, mainJsPath, previewJsPath } = readStorybookConfig(params);
  await buildManager({ outputDir, mainJs });
  await buildPreview({
    pluginConfig: params,
    outputDir,
    rootDir: process.cwd(),
    mainJs,
    mainJsPath,
    previewJsPath,
  });
}
