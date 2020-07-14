import { TestResultError } from '@web/test-runner-core';
import { replaceRelativeStackFilePath } from './replaceRelativeStackFilePath';
import { constants } from '@web/test-runner-core';
const { PARAM_SESSION_ID } = constants;

const REGEXP_TEST_FRAMEWORK_STACK = /.+__web-test-runner__\/.+/;
export const REGEXP_WTR_SESSION_ID = new RegExp(`\\?${PARAM_SESSION_ID}=(\\d|[a-z]|-)*`);

export function formatStackTrace(error: TestResultError, rootDir: string, serverAddress: string) {
  if (!error.stack) {
    return '';
  }

  const strings = error.stack.split('\n');

  // some browsers don't include the error message in the first line, so
  // we add it in that case
  if (!error.stack.includes(error.message)) {
    strings.unshift(`${error.message}\n`);
  }

  return strings
    .filter(str => !REGEXP_TEST_FRAMEWORK_STACK.test(str))
    .map((str, i) => {
      const withoutSessionId = str.replace(REGEXP_WTR_SESSION_ID, '');
      // ensure there is an indentation of 2 spaces
      const trimmedString = `${' '.repeat(i === 0 ? 0 : 2)}${withoutSessionId.trim()}`;

      // replace browser url with relative file path
      return replaceRelativeStackFilePath(trimmedString, rootDir, serverAddress);
    })
    .join('\n');
}
