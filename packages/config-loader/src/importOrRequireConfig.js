const getPackageType = require('./getPackageType');
const path = require('path');
const requireConfig = require('./requireConfig');

/**
 * @param {string} configPath
 */
function importConfig(configPath) {
  // Conditionally requires importConfig function to avoid logging a warning on node v12
  // when not using an es modules
  const importConfigFunction = require('./importConfig');
  return importConfigFunction(configPath);
}

/**
 * @param {string} configPath
 * @param {string} basedir
 */
async function importOrRequireConfig(configPath, basedir) {
  const packageType = await getPackageType(basedir);
  const ext = path.extname(configPath);

  switch (ext) {
    case '.mjs':
      return importConfig(configPath);
    case '.cjs':
      return requireConfig(configPath);
    default:
      return packageType === 'module' ? importConfig(configPath) : requireConfig(configPath);
  }
}

module.exports = importOrRequireConfig;
