import getPackageType from './getPackageType.js';
import path from 'path';
import requireConfig from './requireConfig.js';

/**
 * @param {string} configPath
 */
async function importConfig(configPath) {
  // Conditionally requires importConfig function to avoid logging a warning on node v12
  // when not using an es modules
  const {importConfig} = await import('./importConfig.js');
  return importConfig(configPath);
}

/**
 * @param {string} configPath
 * @param {string} basedir
 */
export default async function importOrRequireConfig(configPath, basedir) {
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
