import * as fs from 'node:fs/promises';

/**
 * @param {string} path
 */
export async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (e) {
    return false;
  }
}
