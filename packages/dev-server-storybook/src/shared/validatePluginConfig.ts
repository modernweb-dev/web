import { StorybookPluginConfig } from './StorybookPluginConfig';
import { createError } from './utils';

const types = ['preact', 'web-components'];

export function validatePluginConfig(pluginConfig: StorybookPluginConfig) {
  if (typeof pluginConfig.type !== 'string') {
    throw createError('Missing project type in config.');
  }

  if (!types.includes(pluginConfig.type)) {
    throw createError(`Invalid project type ${pluginConfig.type}, supported types: ${types}`);
  }
}
