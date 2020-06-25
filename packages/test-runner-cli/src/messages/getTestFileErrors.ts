import { TestSession, TestResultError } from '@web/test-runner-core';
import { TerminalEntry } from '../Terminal';
import { getFailedOnBrowsers } from './utils/getFailedOnBrowsers';
import { formatStackTrace } from './utils/formatStackTrace';
import chalk from 'chalk';
import { replaceRelativeStackFilePath } from './utils/replaceRelativeStackFilePath';

function isSameError(a: TestResultError, b: TestResultError) {
  return a.message === b.message && a.stack === b.stack;
}

interface ErrorReport {
  testFile: string;
  failedBrowsers: string[];
  error: TestResultError;
}

export function getTestFileErrors(
  browserNames: string[],
  favoriteBrowser: string,
  sessionsForTestFile: TestSession[],
  rootDir: string,
  serverAddress: string,
) {
  const entries: TerminalEntry[] = [];
  const reports: ErrorReport[] = [];

  for (const session of sessionsForTestFile) {
    for (const error of session.errors) {
      let report = reports.find(r => isSameError(r.error, error));
      if (!report) {
        report = { testFile: session.testFile, failedBrowsers: [], error };
        reports.push(report);
      }
      report.failedBrowsers.push(session.browserName);

      if (session.browserName === favoriteBrowser) {
        report.error = error;
      }
    }
  }

  for (const report of reports) {
    const formattedStacktrace = formatStackTrace(report.error, rootDir, serverAddress);

    if (formattedStacktrace) {
      const [first, ...rest] = formattedStacktrace.split('\n');
      const restStackString = rest.join('\n');

      // there was a stack trace, take the first line and decorate it with an icon and which browsers it failed on
      entries.push({
        text: `❌ ${first} ${getFailedOnBrowsers(browserNames, report.failedBrowsers)}`,
        indent: 1,
      });

      // if there was more to the stack trace, print it
      if (restStackString) {
        entries.push({ text: chalk.red(restStackString), indent: 4 });
      }
    } else {
      // there was no stack trace, so just print the error message
      entries.push({
        text: `❌ ${
          report.error.message
            ? replaceRelativeStackFilePath(report.error.message, rootDir, serverAddress)
            : 'Unknown error'
        } ${getFailedOnBrowsers(browserNames, report.failedBrowsers)}`,
        indent: 1,
      });
    }

    entries.push('');
  }

  return entries;
}
