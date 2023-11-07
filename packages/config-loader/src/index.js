import { fileExists } from './utils.js';
import path from 'path';
import ConfigLoaderError from './ConfigLoaderError.js';
import importOrRequireConfig from './importOrRequireConfig.js';

const EXTENSIONS = ['.mjs', '.cjs', '.js'];

/**
 * @param {string} name
 * @param {string} [customPath]
 * @param {string} [basedir]
 */
async function readConfig(name, customPath, basedir = process.cwd()) {
  const resolvedCustomPath = customPath ? path.resolve(basedir, customPath) : undefined;
  if (resolvedCustomPath && !(await fileExists(resolvedCustomPath))) {
    throw new ConfigLoaderError(`Could not find a config file at ${resolvedCustomPath}`);
  }

  // load the custom config file
  if (resolvedCustomPath) {
    return importOrRequireConfig(resolvedCustomPath, basedir);
  }

  // iterate file extensions in order, load the config if it exists
  for (const extension of EXTENSIONS) {
    const configPath = path.join(basedir, name + extension);
    if (await fileExists(configPath)) {
      return importOrRequireConfig(configPath, basedir);
    }
  }

  return null;
}

export { readConfig, ConfigLoaderError };
