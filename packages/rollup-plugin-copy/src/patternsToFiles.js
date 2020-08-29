const { listFiles } = require('./listFiles.js');

/**
 *
 * @param {string|string[]} inPatterns
 * @param {string} rootDir
 */
async function patternsToFiles(inPatterns, rootDir) {
  const patterns = typeof inPatterns === 'string' ? [inPatterns] : inPatterns;
  const listFilesPromises = patterns.map(pattern => listFiles(pattern, rootDir));
  const arrayOfFilesArrays = await Promise.all(listFilesPromises);
  const files = [];

  for (const filesArray of arrayOfFilesArrays) {
    for (const filePath of filesArray) {
      files.push(filePath);
    }
  }

  return files;
}

module.exports = { patternsToFiles };
