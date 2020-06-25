import { TestResultError } from '@web/test-runner-core';
import { replaceRelativeStackFilePath } from './replaceRelativeStackFilePath';

export function formatStackTrace(error: TestResultError, rootDir: string, serverAddress: string) {
  if (!error.stack) {
    return '';
  }

  const strings = error.stack.split('\n');

  // some browsers don't include the error message in the first line, so
  // we add it in that case
  if (!strings[0].includes(error.message)) {
    strings.unshift(`${error.message}\n`);
  }

  return strings
    .map((str, i) => {
      // ensure there is an indentation of 2 spaces
      const trimmedString = `${' '.repeat(i === 0 ? 0 : 2)}${str.trim()}`;

      // replace browser url with relative file path
      return replaceRelativeStackFilePath(trimmedString, rootDir, serverAddress);
    })
    .join('\n');
}
