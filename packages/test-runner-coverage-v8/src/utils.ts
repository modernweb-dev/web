import path from 'node:path';

const REGEXP_TO_FILE_PATH = new RegExp('/', 'g');
const REGEXP_TO_BROWSER_PATH = new RegExp('\\\\', 'g');

export function toFilePath(browserPath: string): string {
  return browserPath.replace(REGEXP_TO_FILE_PATH, path.sep);
}

export function toBrowserPath(filePath: string): string {
  const replaced = filePath.replace(REGEXP_TO_BROWSER_PATH, '/');
  if (replaced[0] !== '/') {
    return '/' + replaced;
  }
  return replaced;
}
