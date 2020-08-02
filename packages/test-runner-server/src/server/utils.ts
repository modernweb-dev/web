import path from 'path';

const toBrowserPathRegExp = new RegExp(path.sep === '\\' ? '\\\\' : path.sep, 'g');
const toFilePathRegeExp = new RegExp('/', 'g');

export function toBrowserPath(filePath: string) {
  return filePath.replace(toBrowserPathRegExp, '/');
}

export function toFilePath(browserPath: string) {
  return browserPath.replace(toFilePathRegeExp, path.sep);
}
