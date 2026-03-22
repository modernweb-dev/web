import { listFiles } from './listFiles.ts';

/**
 * Converts glob patterns to an array of matching file paths.
 *
 * @param inPatterns - Single glob pattern or array of glob patterns
 * @param rootDir - The root directory to search from
 * @param exclude - Optional glob pattern(s) to exclude
 * @returns Array of fully resolved file paths
 */
async function patternsToFiles(
  inPatterns: string | string[],
  rootDir: string,
  exclude?: string | string[],
): Promise<string[]> {
  const patterns = typeof inPatterns === 'string' ? [inPatterns] : inPatterns;
  const listFilesPromises = patterns.map(pattern => listFiles(pattern, rootDir, exclude));
  const arrayOfFilesArrays = await Promise.all(listFilesPromises);
  const files: string[] = [];

  for (const filesArray of arrayOfFilesArrays) {
    for (const filePath of filesArray) {
      files.push(filePath);
    }
  }

  return files;
}

export { patternsToFiles };
