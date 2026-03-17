const fs = require('fs').promises;

/**
 * @param {string} path
 */
async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = { fileExists };
