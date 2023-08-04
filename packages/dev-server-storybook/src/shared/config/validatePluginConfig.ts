import { StorybookPluginConfig } from '../config/StorybookPluginConfig.js';
import { createError } from '../utils.js';

const types = ['preact', 'web-components'];

export function validatePluginConfig(pluginConfig: StorybookPluginConfig) {
  if (!pluginConfig) {
    throw createError('Missing plugin configuration.');
  }

  if (typeof pluginConfig.type !== 'string') {
    throw createError('Missing project type in config.');
  }

  if (!types.includes(pluginConfig.type)) {
    throw createError(`Invalid project type ${pluginConfig.type}, supported types: ${types}`);
  }
}
