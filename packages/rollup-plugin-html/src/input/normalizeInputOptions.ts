import { InputOption } from 'rollup';
import { InputHTMLOptions, RollupPluginHTMLOptions } from '../RollupPluginHTMLOptions.js';
import { createError } from '../utils.js';

export function normalizeInputOptions(
  pluginOptions: RollupPluginHTMLOptions,
  rollupInput?: InputOption,
): InputHTMLOptions[] {
  if (pluginOptions.input == null) {
    if (rollupInput == null) {
      throw createError('Missing input option in rollup or in HTML plugin options.');
    }

    if (typeof rollupInput === 'string') {
      return [{ path: rollupInput }];
    }

    if (Array.isArray(rollupInput)) {
      return rollupInput.map(path => ({ path }));
    }

    if (typeof rollupInput === 'object') {
      return Object.entries(rollupInput).map(([name, path]) => ({ name, path }));
    }

    throw createError('Unable to parse rollup input option');
  }

  if (Array.isArray(pluginOptions.input)) {
    return pluginOptions.input.map(input => {
      if (typeof input === 'string') {
        return { path: input };
      }
      return input;
    });
  }

  if (typeof pluginOptions.input === 'object') {
    return [pluginOptions.input];
  }

  if (typeof pluginOptions.input === 'string') {
    return [{ path: pluginOptions.input }];
  }

  throw createError('Unable to parse html plugin input option');
}
