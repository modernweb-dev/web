import { TestSession } from '@web/test-runner-core';
import chalk from 'chalk';
import { TerminalEntry } from '../Terminal';
import { getFileErrors } from './getFileErrors';
import { getBrowserLogs } from './getBrowserLogs';
import { getRequest404s } from './getRequest404s';
import { getSessionErrors } from './getSessionErrors';

export function getTestFileReport(
  testFile: string,
  allBrowserNames: string[],
  favoriteBrowser: string,
  serverAddress: string,
  sessionsForTestFile: TestSession[],
) {
  const failedSessions = sessionsForTestFile.filter(s => !s.passed);
  const entries: TerminalEntry[] = [];

  entries.push(...getBrowserLogs(sessionsForTestFile));
  entries.push(...getRequest404s(sessionsForTestFile));
  entries.push(...getSessionErrors(sessionsForTestFile));

  if (failedSessions.length > 0) {
    entries.push(...getFileErrors(testFile, allBrowserNames, favoriteBrowser, failedSessions));
  }

  if (entries.length > 0) {
    entries.unshift('');
    entries.unshift(`${chalk.bold(chalk.cyanBright(testFile))}:`);
  }

  return entries;
}
