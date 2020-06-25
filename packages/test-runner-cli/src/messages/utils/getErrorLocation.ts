import { TestResultError } from '@web/test-runner-core';
import { getRelativeStackFilePath } from './getRelativeStackFilePath';

export function getErrorLocation(err: TestResultError, rootDir: string, serverAddress: string) {
  if (!err.stack) {
    return undefined;
  }

  for (const line of err.stack.split('\n')) {
    const result = getRelativeStackFilePath(line, rootDir, serverAddress);
    if (result?.relativeFilePath) {
      return result.relativeFilePath;
    }
  }
}
