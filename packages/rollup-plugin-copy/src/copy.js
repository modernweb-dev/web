const fs = require('fs');
const path = require('path');
const { patternsToFiles } = require('./patternsToFiles.js');

/**
 * Copies all files from the given patterns retaining relative pathes to the root folder
 *
 * @param {object} options
 * @param {string|string[]} options.patterns
 * @param {string} [options.rootDir]
 * @return {import('rollup').Plugin}
 */
function copy({ patterns = [], rootDir = process.cwd() }) {
  const resolvedRootDir = path.resolve(rootDir);
  return {
    name: '@web/rollup-plugin-copy',
    async generateBundle() {
      const files = await patternsToFiles(patterns, rootDir);
      for (const filePath of files) {
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
