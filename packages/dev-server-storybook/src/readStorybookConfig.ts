import path from 'path';
import fs from 'fs';

import { StorybookPluginConfig } from './StorybookPluginConfig';
import { createError } from './utils';

const defaultConfigDir = path.join(process.cwd(), '.storybook');

export interface MainJs {
  stories: string[];
  addons?: string[];
}

function validateMainJs(mainJs: any): MainJs {
  if (typeof mainJs !== 'object') {
    throw createError('main.js must export an bject');
  }
  if (mainJs.stories == null) {
    throw createError('Missing stories option in main.js');
  }
  if (!Array.isArray(mainJs.stories)) {
    throw createError('Stories option main.js must be an array');
  }
  if (mainJs.addons != null && !Array.isArray(mainJs.addons)) {
    throw createError('Addons in main.js must be an array');
  }
  return mainJs as MainJs;
}

export function readStorybookConfig(pluginConfig: StorybookPluginConfig) {
  const configDir = pluginConfig.configDir
    ? path.resolve(pluginConfig.configDir)
    : defaultConfigDir;
  const mainJsPath = path.join(configDir, 'main.js');
  const previewJsPath = path.join(configDir, 'preview.js');

  if (!fs.existsSync(mainJsPath)) {
    throw createError(
      `Could not find any storybook configuration at ${mainJsPath}. You can change the storybook config directory using the configDir option.`,
    );
  }

  const mainJs = validateMainJs(require(mainJsPath));

  return { mainJs, mainJsPath, previewJsPath };
}
