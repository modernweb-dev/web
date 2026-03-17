import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

/**
 * Lists all files using the specified glob, starting from the given root directory.
 *
 * Will return all matching file paths fully resolved.
 *
 * @param fromGlob - The glob pattern to match files
 * @param rootDir - The root directory to search from
 * @param ignore - Optional glob pattern(s) to ignore
 * @returns Array of fully resolved file paths
 */
async function listFiles(
  fromGlob: string,
  rootDir: string,
  ignore?: string | string[]
): Promise<string[]> {
  // remember, each filepath returned is relative to rootDir
  return (
    (await glob(fromGlob, { cwd: rootDir, dot: true, ignore }))
      // fully resolve the filename relative to rootDir
      .map(filePath => path.resolve(rootDir, filePath))
      // filter out directories
      .filter(filePath => !fs.lstatSync(filePath).isDirectory())
  );
}

export { listFiles };
