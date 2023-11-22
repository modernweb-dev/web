import ConfigLoaderError from './ConfigLoaderError.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// These strings may be node-version dependent and need updating over time
// They're just to display a helpful error message
const ESM_ERRORS = [
  "SyntaxError: Unexpected token 'export'",
  'SyntaxError: Cannot use import statement outside a module',
];

/**
 * @param {string} path
 */
export default function requireConfig(path) {
  try {
    return require(path);
  } catch (e) {
    if (ESM_ERRORS.some(msg => /** @type {Error} **/(e).stack?.includes(msg))) {
      throw new ConfigLoaderError(
        'You are using es module syntax in a config loaded as CommonJS module. ' +
          'Use require/module.exports syntax, or load the file as es module by using the .mjs ' +
          'file extension or by setting type="module" in your package.json.',
      );
    }
    throw e;
  }
}
