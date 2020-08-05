const fs = require('fs').promises;
const path = require('path');
const { fileExists } = require('./utils');

/**
 * Gets the package type for a given directory. Walks up the file system, looking
 * for a package.json file and returns the package type.
 * @param {string} basedir
 * @returns {Promise<string>}
 */
async function getPackageType(basedir) {
  let currentPath = basedir;
  try {
    while (await fileExists(currentPath)) {
      const pkgJsonPath = path.join(currentPath, 'package.json');

      if (await fileExists(pkgJsonPath)) {
        const pkgJsonString = await fs.readFile(pkgJsonPath, { encoding: 'utf-8' });
        const pkgJson = JSON.parse(pkgJsonString);
        return pkgJson.type || 'commonjs';
      }

      currentPath = path.resolve(currentPath, '..');
    }
  } catch (e) {
    // don't log any error
  }
  return 'commonjs';
}

module.exports = getPackageType;
