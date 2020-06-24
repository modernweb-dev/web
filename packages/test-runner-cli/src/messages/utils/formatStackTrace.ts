import { TestResultError } from '@web/test-runner-core';

export function formatStackTrace(error: TestResultError, serverAddress: RegExp) {
  if (!error.stack) {
    return '';
  }

  const strings = error.stack.split('\n');

  // some browsers don't include the error message in the first line, so
  // we add it in that case
  if (!strings[0].includes(error.message)) {
    strings.unshift(`${error.message}\n`);
  }

  return (
    strings
      // remove server address and indent with 2 spaces
      .map((str, i) => `${' '.repeat(i === 0 ? 0 : 2)}${str.trim().replace(serverAddress, '')}`)
      .join('\n')
  );
}
