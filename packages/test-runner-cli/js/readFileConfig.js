/**
 * This file is not TS because we need to preserve the dynamic import statement when compiling to commonjs.
 * This is needed to support ESM and CJS configs
 */

/* eslint-disable */
const fs = require('fs');
const path = require('path');

const CONFIG_NAME = 'web-test-runner';
const EXTENSIONS = ['.mjs', '.cjs', '.js'];

async function readFileConfig() {
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
    const resolvedPath = require.resolve(configFileName);
    // node version doesn't support ESM, load it as cjs
    return fs.existsSync(resolvedPath) ? require(resolvedPath) : {};
  }

  // load config using dynamic import, resolving .mjs over .cjs over .js.
  // this supports configs written in CJS and ESM, using node's project configuration
  for (const extension of EXTENSIONS) {
    const resolvedPath = `${configFileName}${extension}`;

    if (fs.existsSync(resolvedPath)) {
      const config = await import(resolvedPath);

      if (typeof config.default !== 'object') {
        throw new Error(
          `Config at ${resolvedPath} should have a default export that is an object.`,
        );
      }
      return config.default;
    }
  }

  return {};
}

module.exports = { readFileConfig };
