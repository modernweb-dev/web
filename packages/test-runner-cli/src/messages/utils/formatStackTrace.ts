import { TestResultError } from '@web/test-runner-core';
import { replaceRelativeStackFilePath } from './replaceRelativeStackFilePath';
import { constants } from '@web/test-runner-core';
import { SourceMapFunction } from './createSourceMapFunction';
const { PARAM_SESSION_ID } = constants;

const REGEXP_TEST_FRAMEWORK_STACK = /.+__web-test-runner__\/.+/;
export const REGEXP_WTR_SESSION_ID = new RegExp(`\\?${PARAM_SESSION_ID}=(\\d|[a-z]|-)*`);

export async function formatStackTrace(
  error: TestResultError,
  userAgent: string,
  rootDir: string,
  stackLocationRegExp: RegExp,
  sourceMapFunction: SourceMapFunction,
) {
  if (!error.stack) {
    return '';
  }

  const strings = error.stack.split('\n');

  // some browsers don't include the error message in the first line, so
  // we add it in that case
  if (!error.stack.includes(error.message)) {
    strings.unshift(`${error.message}\n`);
  }

  const formatPromises = [];

  let i = 0;
  for (const string of strings) {
    if (!REGEXP_TEST_FRAMEWORK_STACK.test(string)) {
      const withoutSessionId = string.replace(REGEXP_WTR_SESSION_ID, '');
      // ensure there is an indentation of 2 spaces
      const trimmedString = `${' '.repeat(i === 0 ? 0 : 2)}${withoutSessionId.trim()}`;

      // replace browser url with relative file path
      formatPromises.push(
        replaceRelativeStackFilePath(
          trimmedString,
          userAgent,
          rootDir,
          stackLocationRegExp,
          sourceMapFunction,
        ),
      );
    }
    i += 1;
  }

  return (await Promise.all(formatPromises)).join('\n');
}
