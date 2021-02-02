import globby from 'globby';
import path from 'path';

import { createBrowserImport, createError } from '../utils';

export async function findStories(rootDir: string, mainJsPath: string, storiesPatterns: string[]) {
  const mainJsDir = path.dirname(mainJsPath);
  const storyPaths = await globby(storiesPatterns, { cwd: mainJsDir, absolute: false });
  const storyFilePaths = storyPaths.map(p => path.join(mainJsDir, p.split('/').join(path.sep)));

  if (storyFilePaths.length === 0) {
    throw createError(`Could not find any stories with pattern ${storiesPatterns}`);
  }

  const storyImports = storyFilePaths.map(storyFilePath =>
    createBrowserImport(rootDir, storyFilePath),
  );

  return { storyFilePaths, storyImports };
}
