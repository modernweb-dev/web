const { listFiles } = require('./listFiles.js');

/**
 *
 * @param {string|string[]} inPatterns
 * @param {string} rootDir
 * @param {string|string[]} [exclude]
 */
async function patternsToFiles(inPatterns, rootDir, exclude) {
  const patterns = typeof inPatterns === 'string' ? [inPatterns] : inPatterns;
  const listFilesPromises = patterns.map(pattern => listFiles(pattern, rootDir, exclude));
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
