import { TestSession } from '@web/test-runner-core';
import chalk from 'chalk';
import { TerminalEntry } from '../Terminal';
import { getTestsErrors } from './getTestsErrors';
import { getBrowserLogs } from './getBrowserLogs';
import { getRequest404s } from './getRequest404s';
import { getTestFileErrors } from './getTestFileErrors';

export function getTestFileReport(
  testFile: string,
  allBrowserNames: string[],
  favoriteBrowser: string,
  serverAddressRegExp: RegExp,
  sessionsForTestFile: TestSession[],
) {
  const failedSessions = sessionsForTestFile.filter(s => !s.passed);
  const entries: TerminalEntry[] = [];

  entries.push(...getBrowserLogs(sessionsForTestFile));
  entries.push(...getRequest404s(sessionsForTestFile));
  entries.push(
    ...getTestFileErrors(
      allBrowserNames,
      favoriteBrowser,
      sessionsForTestFile,
      serverAddressRegExp,
    ),
  );

  if (failedSessions.length > 0) {
    entries.push(
      ...getTestsErrors(
        testFile,
        allBrowserNames,
        favoriteBrowser,
        failedSessions,
        serverAddressRegExp,
      ),
    );
  }

  if (entries.length > 0) {
    entries.unshift('');
    entries.unshift(`${chalk.bold(chalk.cyanBright(testFile))}:`);
  }

  return entries;
}
