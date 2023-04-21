import globby from 'globby';
import path from 'path';

import { createBrowserImport, createError } from '../utils';

export async function findStories(
  rootDir: string,
  mainJsPath: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  stories: string[] | Function,
) {
  const mainJsDir = path.dirname(mainJsPath);
  const storiesPatterns: string[] =
    typeof stories === 'function' ? await Promise.resolve(stories()) : stories;
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
