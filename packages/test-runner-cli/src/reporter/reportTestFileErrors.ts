import { TestSession, TestResultError, Logger } from '@web/test-runner-core';
import chalk from 'chalk';

import { replaceRelativeStackFilePath } from '../utils/replaceRelativeStackFilePath';
import { SourceMapFunction } from '../utils/createSourceMapFunction';
import { getFailedOnBrowsers } from '../utils/getFailedOnBrowsers';
import { formatStackTrace } from '../utils/formatStackTrace';

function isSameError(a: TestResultError, b: TestResultError) {
  return a.message === b.message && a.stack === b.stack;
}

interface ErrorReport {
  testFile: string;
  failedBrowsers: string[];
  error: TestResultError;
  userAgent: string;
}

export async function reportTestFileErrors(
  logger: Logger,
  browserNames: string[],
  favoriteBrowser: string,
  sessionsForTestFile: TestSession[],
  rootDir: string,
  stackLocationRegExp: RegExp,
  sourceMapFunction: SourceMapFunction,
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
          userAgent: session.userAgent!,
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
    const formattedStacktrace = await formatStackTrace(
      report.error,
      report.userAgent,
      rootDir,
      stackLocationRegExp,
      sourceMapFunction,
    );

    if (formattedStacktrace) {
      const [first, ...rest] = formattedStacktrace.split('\n');
      const restStackString = rest.join('\n');
      // there was a stack trace, take the first line and decorate it with an icon and which browsers it failed on
      logger.log(` ❌ ${first} ${getFailedOnBrowsers(browserNames, report.failedBrowsers)}`);

      // if there was more to the stack trace, print it
      if (restStackString) {
        logger.group();
        logger.group();
        logger.log(chalk.red(restStackString));
        logger.groupEnd();
        logger.groupEnd();
      }
    } else {
      // there was no stack trace, so just print the error message
      const message = report.error.message
        ? await replaceRelativeStackFilePath(
            report.error.message,
            report.userAgent,
            rootDir,
            stackLocationRegExp,
            sourceMapFunction,
          )
        : 'Unknown error';
      logger.log(` ❌ ${message} ${getFailedOnBrowsers(browserNames, report.failedBrowsers)}`);
    }

    logger.log('');
  }
}
