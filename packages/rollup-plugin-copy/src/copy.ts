import fs from 'fs';
import path from 'path';
import type { Plugin } from 'rollup';
import { patternsToFiles } from './patternsToFiles.ts';

/**
 * Options for the copy plugin.
 */
interface CopyOptions {
  /**
   * Single glob or an array of globs
   */
  patterns: string | string[];
  /**
   * Single glob or an array of globs to exclude
   */
  exclude?: string | string[];
  /**
   * Root directory (defaults to current working directory)
   */
  rootDir?: string;
}

/**
 * Copies all files from the given patterns retaining relative paths relative to the root directory.
 *
 * @example
 * // Copy all svg, jpg and json files
 * copy({ patterns: '**\/*.{svg,jpg,json}' })
 * // Copy svg files from two different folders
 * copy({ patterns: ['icons\/*.svg', 'test/icons\/*.svg'] })
 * // Copy all svg files relative to given rootDir
 * copy({ patterns: '**\/*.svg', rootDir: './my-path/' })
 * // you can combine it with path.resolve
 * copy({ patterns: '**\/*.svg', rootDir: path.resolve('./my-path/')  })
 *
 * @param options - Configuration options for the plugin
 * @returns A Rollup Plugin
 */
function copy({ patterns = [], rootDir = process.cwd(), exclude }: CopyOptions): Plugin {
  const resolvedRootDir = path.resolve(rootDir);
  let filesToCopy: string[] = [];
  return {
    name: '@web/rollup-plugin-copy',
    async buildStart() {
      filesToCopy = await patternsToFiles(patterns, rootDir, exclude);
      for (const filePath of filesToCopy) {
        this.addWatchFile(filePath);
      }
    },
    async generateBundle() {
      for (const filePath of filesToCopy) {
        const fileName = path.relative(resolvedRootDir, filePath);
        this.emitFile({
          type: 'asset',
          fileName,
          source: fs.readFileSync(filePath),
        });
      }
    },
  };
}

export { copy };
