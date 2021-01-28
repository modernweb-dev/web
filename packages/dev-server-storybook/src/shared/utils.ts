import path from 'path';
import pathIsInside from 'path-is-inside';

export function createError(msg: string) {
  return new Error(`[@web/dev-server-storybook] ${msg}`);
}

export function createBrowserImport(rootDir: string, filePath: string) {
  if (!pathIsInside(filePath, rootDir)) {
    throw createError(
      `The file ${filePath} is not accessible by the browser because it is outside the root directory ${rootDir}. ` +
        'Change the rootDir option to include this directory.',
    );
  }

  const relativeFilePath = path.relative(rootDir, filePath);
  const browserPath = relativeFilePath.split(path.sep).join('/');
  return `./${browserPath}`;
}
