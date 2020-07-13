import path from 'path';

const REGEXP_ABSOLUTE = /^(?:\/|(?:[A-Za-z]:)?[\\|/])/;

/**
 * Turns a file path into a path suitable for browsers, with a / as seperator.
 * @param {string} filePath
 * @returns {string}
 */
export function toBrowserPath(filePath: string) {
  return filePath.replace(new RegExp(path.sep === '\\' ? '\\\\' : path.sep, 'g'), '/');
}

export function isAbsoluteFilePath(path: string) {
  return REGEXP_ABSOLUTE.test(path);
}
