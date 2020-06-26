const path = require('path');
const { fileExists } = require('./src/utils');
const ConfigLoaderError = require('./src/ConfigLoaderError.js');
const importOrRequireConfig = require('./src/importOrRequireConfig');
const EXTENSIONS = ['.mjs', '.cjs', '.js'];

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

module.exports = { readConfig, ConfigLoaderError };
