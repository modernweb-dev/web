const { glob } = require('glob');
const fs = require('fs');
const path = require('path');

/**
 * Lists all files using the specified glob, starting from the given root directory.
 *
 * Will return all matching file paths fully resolved.
 *
 * @param {string} fromGlob
 * @param {string} rootDir
 * @param {string|string[]} [ignore]
 */
async function listFiles(fromGlob, rootDir, ignore) {
  // remember, each filepath returned is relative to rootDir
  return (
    (await glob(fromGlob, { cwd: rootDir, dot: true, ignore }))
      // fully resolve the filename relative to rootDir
      .map(filePath => path.resolve(rootDir, filePath))
      // filter out directories
      .filter(filePath => !fs.lstatSync(filePath).isDirectory())
  );
}

module.exports = { listFiles };
