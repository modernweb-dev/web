/**
 * @param {string} configPath
 */
async function importConfig(configPath) {
  // Conditionally requires importConfig function to avoid logging a warning on node v12
  // when not using an es modules
  const {importConfig: importConfigFunction} = await import('./importConfig.js');
  return importConfigFunction(configPath);
}

/**
 * @param {string} configPath
 * @param {string} basedir
 */
export async function importOrRequireConfig(configPath, basedir) {
  return importConfig(configPath);
}
