const ConfigLoaderError = require('./ConfigLoaderError');

// These strings may be node-version dependent and need updating over time
// They're just to display a helpful error message
const CJS_ERRORS = [
  'ReferenceError: module is not defined',
  'ReferenceError: require is not defined',
  'ReferenceError: exports is not defined',
];

async function supportsEsm() {
  try {
    await import(__filename);
  } catch (error) {
    return false;
  }
  return true;
}

module.exports = async function importConfig(path) {
  if (!(await supportsEsm())) {
    throw new ConfigLoaderError(
      'You are trying to load a config as es module but your version of node does not support it. ' +
        'Update to node v12.17.0 or higher, or load the config as commonjs by using the .cjs extension ' +
        'or .js without type="module" set in your package.json',
    );
  }

  try {
    const config = await import(path);

    if (typeof config.default !== 'object') {
      throw new ConfigLoaderError(
        `Config at ${path} should have a default export that is an object.`,
      );
    }

    return config.default;
  } catch (e) {
    if (CJS_ERRORS.some(msg => e.stack.includes(msg))) {
      throw new ConfigLoaderError(
        'You are using CommonJS syntax in a config loaded as es module. ' +
          'Use import/export syntax, or load the file as a CommonJS module by ' +
          'using the .cjs file extension or by removing type="module" from your package.json.',
      );
    }
    throw e;
  }
};
