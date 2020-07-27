import { TestResultError } from '@web/test-runner-core';
import { getRelativeStackFilePath } from './getRelativeStackFilePath';
import { SourceMapFunction } from './createSourceMapFunction';
import { REGEXP_TEST_FRAMEWORK_STACK } from './formatStackTrace';

export async function getErrorLocation(
  err: TestResultError,
  userAgent: string,
  rootDir: string,
  stackLocationRegExp: RegExp,
  sourceMapFunction: SourceMapFunction,
) {
  if (!err.stack) {
    return undefined;
  }

  for (const line of err.stack.split('\n')) {
    if (!REGEXP_TEST_FRAMEWORK_STACK.test(line)) {
      const result = await getRelativeStackFilePath(
        line,
        userAgent,
        rootDir,
        stackLocationRegExp,
        sourceMapFunction,
      );

      if (result?.relativeFilePath) {
        return `${result.relativeFilePath}${result.location}`;
      }
    }
  }
}
