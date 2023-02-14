import { TestResultError, TestSession, Logger } from '@web/test-runner-core';
import { formatError } from '@web/browser-logs';

import { getFailedOnBrowsers } from './utils/getFailedOnBrowsers';
import { getFlattenedTestResults } from './utils/getFlattenedTestResults';

export function reportTestsErrors(
  logger: Logger,
  allBrowserNames: string[],
  favoriteBrowser: string,
  failedSessions: TestSession[],
) {
  const testErrorsPerBrowser = new Map<string, Map<string, TestResultError>>();

  for (const session of failedSessions) {
    if (session.testResults) {
      const flattenedTests = getFlattenedTestResults(session.testResults);
      for (const test of flattenedTests) {
        if (test.error) {
          let testErrorsForBrowser = testErrorsPerBrowser.get(test.name);
          if (!testErrorsForBrowser) {
            testErrorsForBrowser = new Map<string, TestResultError>();
            testErrorsPerBrowser.set(test.name, testErrorsForBrowser);
          }
          if (test.error) {
            testErrorsForBrowser.set(session.browser.name, test.error);
          }
        }
      }
    }
  }

  if (testErrorsPerBrowser.size > 0) {
    for (const [name, errorsForBrowser] of testErrorsPerBrowser) {
      const failedBrowsers = Array.from(errorsForBrowser.keys());
      const error =
        errorsForBrowser.get(favoriteBrowser) ?? errorsForBrowser.get(failedBrowsers[0])!;
      const failedOn = getFailedOnBrowsers(allBrowserNames, failedBrowsers);

      logger.log(` ❌ ${name}${failedOn}`);
      logger.group();
      logger.group();
      logger.group();
      logger.log(formatError(error));
      logger.groupEnd();
      logger.groupEnd();
      logger.groupEnd();
      logger.log('');
    }
  }
}
