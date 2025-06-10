const { pathToFileURL } = require('url');
const ConfigLoaderError = require('./ConfigLoaderError');

// These strings may be node-version dependent and need updating over time
// They're just to display a helpful error message
const CJS_ERRORS = [
  'ReferenceError: module is not defined',
  'ReferenceError: require is not defined',
  'ReferenceError: exports is not defined',
];

/**
 * @param {string} path
 */
async function importConfig(path) {
  try {
    const config = await import(pathToFileURL(path).href);

    if (typeof config.default !== 'object') {
      throw new ConfigLoaderError(
        `Config at ${path} should have a default export that is an object.`,
      );
    }

    return config.default;
  } catch (e) {
    if (CJS_ERRORS.some(msg => /** @type {Error} */(e).stack?.includes(msg))) {
      throw new ConfigLoaderError(
        'You are using CommonJS syntax such as "require" or "module.exports" in a config loaded as es module. ' +
          'Use import/export syntax, or load the file as a CommonJS module by ' +
          'using the .cjs file extension or by removing type="module" from your package.json.',
      );
    }
    throw e;
  }
}

module.exports = importConfig;
