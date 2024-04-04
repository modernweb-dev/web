import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

import { StorybookPluginConfig } from './StorybookPluginConfig.js';
import { createError } from '../utils.js';
import { MainJs, StorybookConfig } from './StorybookConfig.js';

const defaultConfigDir = path.join(process.cwd(), '.storybook');

function validateMainJs(mainJs: MainJs): MainJs {
  if (typeof mainJs !== 'object') {
    throw createError('main.js must export an object');
  }
  if (mainJs.stories == null) {
    throw createError('Missing stories option in main.js');
  }
  if (!(Array.isArray(mainJs.stories) || typeof mainJs.stories === 'function')) {
    throw createError('Stories option main.js must be an array or function');
  }
  if (mainJs.addons != null) {
    if (!Array.isArray(mainJs.addons)) {
      throw createError('Addons in main.js must be an array');
    }
    if (mainJs.addons.some(addon => addon.startsWith('@storybook'))) {
      throw createError(
        'Official storybook addons are not es modules, and cannot be loaded from this storybook implementation.',
      );
    }
  }
  return mainJs;
}

export async function readStorybookConfig(
  pluginConfig: StorybookPluginConfig,
): Promise<StorybookConfig> {
  const configDir = pluginConfig.configDir
    ? path.resolve(pluginConfig.configDir)
    : defaultConfigDir;

  const commonJsMainPath = path.join(configDir, 'main.cjs');
  const mainJsPath = path.join(configDir, 'main.js');

  const managerJsPath = path.join(configDir, 'manager.js');
  const previewJsPath = path.join(configDir, 'preview.js');
  const managerHeadPath = path.join(configDir, 'manager-head.html');
  const previewHeadPath = path.join(configDir, 'preview-head.html');
  const previewBodyPath = path.join(configDir, 'preview-body.html');
  let managerHead: string | undefined = undefined;
  let previewHead: string | undefined = undefined;
  let previewBody: string | undefined = undefined;

  const mainJsExists = fs.existsSync(mainJsPath);
  const commonJsMainExists = fs.existsSync(commonJsMainPath);

  if (!mainJsExists && !commonJsMainExists) {
    throw createError(
      `Could not find any storybook configuration at ${mainJsPath} or ${commonJsMainPath}. You can change the storybook config directory using the configDir option.`,
    );
  }

  if (fs.existsSync(managerHeadPath)) {
    managerHead = fs.readFileSync(managerHeadPath, 'utf-8');
  }
  if (fs.existsSync(previewHeadPath)) {
    previewHead = fs.readFileSync(previewHeadPath, 'utf-8');
  }
  if (fs.existsSync(previewBodyPath)) {
    previewBody = fs.readFileSync(previewBodyPath, 'utf-8');
  }

  const mainJs = commonJsMainExists
    ? validateMainJs((await import(pathToFileURL(commonJsMainPath).href)).default)
    : validateMainJs((await import(pathToFileURL(mainJsPath).href)).default);

  return {
    mainJs,
    mainJsPath,
    managerJsPath,
    previewJsPath,
    managerHead,
    previewHead,
    previewBody,
  };
}
