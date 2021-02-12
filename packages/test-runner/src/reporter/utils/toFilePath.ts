import path from 'path';

/**
 * Transforms a file system path to a browser URL. For example windows uses `\` on the file system,
 * but it should use `/` in the browser.
 */
export function toFilePath(browserPath: string) {
  return browserPath.split('/').join(path.sep);
}
