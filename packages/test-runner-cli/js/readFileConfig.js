/**
 * This file is not TS because we need to preserve the dynamic import statement when compiling to commonjs.
 * This is needed to support ESM and CJS configs
 */

/* eslint-disable */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const CONFIG_NAME = 'web-test-runner';
const EXTENSIONS = ['.mjs', '.cjs', '.js'];

async function importConfig(path) {
  if (fs.existsSync(path)) {
    const config = await import(path);

    if (typeof config.default !== 'object') {
      throw new Error(`Config at ${path} should have a default export that is an object.`);
    }
    return config.default;
  }
}

async function readFileConfig(customPath) {
  const resolvedCustomPath = customPath ? path.join(process.cwd(), customPath) : undefined;
  if (resolvedCustomPath) {
    if (!fs.existsSync(resolvedCustomPath)) {
      console.error(chalk.red(`\nCould not find a config at ${resolvedCustomPath}\n`));
      process.exit(1);
    }
  }

  // check if node version supports dynamic imports
  const supportsEsm = await (async () => {
    try {
      await import(__filename);
    } catch (error) {
      return false;
    }
    return true;
  })();

  const configFileName = path.join(process.cwd(), `${CONFIG_NAME}.config`);

  if (!supportsEsm) {
    try {
      // node version doesn't support ESM, load it as cjs
      if (resolvedCustomPath) {
        return require(resolvedCustomPath);
      }

      return require(configFileName);
    } catch {
      // no config found
      return {};
    }
  }

  if (resolvedCustomPath) {
    return importConfig(resolvedCustomPath);
  }

  // load config using dynamic import, resolving .mjs over .cjs over .js.
  // this supports configs written in CJS and ESM, using node's project configuration
  for (const extension of EXTENSIONS) {
    const resolvedPath = `${configFileName}${extension}`;
    const config = await importConfig(resolvedPath);

    if (config) {
      return config;
    }
  }

  return {};
}

module.exports = { readFileConfig };
