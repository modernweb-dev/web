import { readStorybookConfig } from '../shared/readStorybookConfig';
import { validatePluginConfig } from '../shared/validatePluginConfig';
import { buildManager } from './buildManager';
import { buildPreview } from './buildPreview';

export interface BuildRollupParams {
  type: 'web-components' | 'preact';
  outputDir: string;
  configDir: string;
}

export async function buildRollup(params: BuildRollupParams) {
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
