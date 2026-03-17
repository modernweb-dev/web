const fs = require('fs');
const path = require('path');
const { patternsToFiles } = require('./patternsToFiles.js');

/**
 * Copies all files from the given patterns retaining relative paths relative to the root directory.
 *
 * @example
 * // Copy all svg, jpg and json files
 * copy({ patterns: '**\/*.{svg,jpg,json}' })
 * // Copy svg files from two different folders
 * copy({ patterns: ['icons\/*.svg', 'test/icons\/*.svg'] })
 * // Copy all svg files relative to given rootDir
 * copy({ patterns: '**\/*.svg', rootDir: './my-path/' })
 * // you can combine it with path.resolve
 * copy({ patterns: '**\/*.svg', rootDir: path.resolve('./my-path/')  })
 *
 * @param {object} options
 * @param {string|string[]} options.patterns Single glob or an array of globs
 * @param {string|string[]} options.exclude Single glob or an array of globs
 * @param {string} [options.rootDir] Defaults to current working directory
 * @return {import('rollup').Plugin} A Rollup Plugin
 */
function copy({ patterns = [], rootDir = process.cwd(), exclude }) {
  const resolvedRootDir = path.resolve(rootDir);
  /** @type {string[]} */
  let filesToCopy = [];
  return {
    name: '@web/rollup-plugin-copy',
    async buildStart() {
      filesToCopy = await patternsToFiles(patterns, rootDir, exclude);
      for (const filePath of filesToCopy) {
        this.addWatchFile(filePath);
      }
    },
    async generateBundle() {
      for (const filePath of filesToCopy) {
        const fileName = path.relative(resolvedRootDir, filePath);
        this.emitFile({
          type: 'asset',
          fileName,
          source: fs.readFileSync(filePath),
        });
      }
    },
  };
}

module.exports = { copy };
