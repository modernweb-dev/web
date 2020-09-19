import path from 'path';

const toBrowserPathRegExp = new RegExp(path.sep === '\\' ? '\\\\' : path.sep, 'g');
const toFilePathRegeExp = new RegExp('/', 'g');

export function toBrowserPath(filePath: string) {
  return filePath.replace(toBrowserPathRegExp, '/');
}

export function toFilePath(browserPath: string) {
  return browserPath.replace(toFilePathRegeExp, path.sep);
}

export function createBrowserTestFilePath(rootDir: string, filePath: string) {
  const fullFilePath = path.resolve(filePath);
  const relativeToRootDir = path.relative(rootDir, fullFilePath);
  return encodeURI(toBrowserPath(relativeToRootDir));
}
