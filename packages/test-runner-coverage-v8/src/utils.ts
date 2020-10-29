import path from 'path';

const REGEXP_TO_FILE_PATH = new RegExp('/', 'g');

export function toFilePath(browserPath: string) {
  return browserPath.replace(REGEXP_TO_FILE_PATH, path.sep);
}
