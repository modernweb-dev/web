import glob from 'glob';
import fs from 'fs';
import path from 'path';

/**
 * Lists all files using the specified glob, starting from the given root directory.
 *
 * Will return all matching file paths fully resolved.
 *
 * @param {string} fromGlob
 * @param {string} rootDir
 * @param {string|string[]} [ignore]
 */
export function listFiles(fromGlob, rootDir, ignore) {
  return new Promise(resolve => {
    glob(fromGlob, { cwd: rootDir, dot: true, ignore }, (er, files) => {
      // remember, each filepath returned is relative to rootDir
      resolve(
        files
          // fully resolve the filename relative to rootDir
          .map(filePath => path.resolve(rootDir, filePath))
          // filter out directories
          .filter(filePath => !fs.lstatSync(filePath).isDirectory()),
      );
    });
  });
}
