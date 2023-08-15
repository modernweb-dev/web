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
 *
 * @returns Promise<string[]>
 */
async function listFiles(fromGlob, rootDir, ignore) {
  const files = (await glob(fromGlob, { cwd: rootDir, dot: true, ignore })) || [];
  return files
    .map(filePath => path.resolve(rootDir, filePath))
    .filter(filePath => !fs.lstatSync(filePath).isDirectory());
}

module.exports = { listFiles };
