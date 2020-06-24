import { TestResultError } from '@web/test-runner-core';

export function formatErrorMessage(error: TestResultError, serverAddress: RegExp) {
  if (!error.message) {
    return '';
  }

  return error.message.replace(serverAddress, '');
}
