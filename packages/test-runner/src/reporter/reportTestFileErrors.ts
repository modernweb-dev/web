import { TestSession, TestResultError, Logger } from '@web/test-runner-core';
import chalk from 'chalk';

import { getFailedOnBrowsers } from './utils/getFailedOnBrowsers';

function isSameError(a: TestResultError, b: TestResultError) {
  return a.message === b.message && a.stack === b.stack;
}

interface ErrorReport {
  testFile: string;
  failedBrowsers: string[];
  error: TestResultError;
}

export function reportTestFileErrors(
  logger: Logger,
  browserNames: string[],
  favoriteBrowser: string,
  sessionsForTestFile: TestSession[],
) {
  const reports: ErrorReport[] = [];

  for (const session of sessionsForTestFile) {
    for (const error of session.errors) {
      let report = reports.find(r => isSameError(r.error, error));
      if (!report) {
        report = {
          testFile: session.testFile,
          failedBrowsers: [],
          error,
        };
        reports.push(report);
      }
      report.failedBrowsers.push(session.browser.name);

      if (session.browser.name === favoriteBrowser) {
        report.error = error;
      }
    }
  }

  for (const report of reports) {
    const { name, message = 'Unknown error' } = report.error;
    const errorMsg = name ? `${name}: ${message}` : message;
    const failedOn = getFailedOnBrowsers(browserNames, report.failedBrowsers);

    if (report.error.stack) {
      // there was a stack trace, take the first line and decorate it with an icon and which browsers it failed on
      logger.log(` ❌ ${chalk.red(errorMsg)} ${failedOn}`);

      // if there was more to the stack trace, print it
      logger.group();
      logger.group();
      logger.log(chalk.gray(report.error.stack));
      logger.groupEnd();
      logger.groupEnd();
    } else {
      // there was no stack trace, so just print the error message
      logger.log(` ❌ ${errorMsg} ${failedOn}`);
    }

    logger.log('');
  }
}
