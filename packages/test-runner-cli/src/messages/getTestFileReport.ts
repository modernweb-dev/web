import { TestSession } from '@web/test-runner-core';
import chalk from 'chalk';
import { relative } from 'path';
import { TerminalEntry } from '../Terminal';
import { getTestsErrors } from './getTestsErrors';
import { getBrowserLogs } from './getBrowserLogs';
import { getRequest404s } from './getRequest404s';
import { getTestFileErrors } from './getTestFileErrors';
import { SourceMapFunction } from './utils/createSourceMapFunction';

export async function getTestFileReport(
  testFile: string,
  allBrowserNames: string[],
  favoriteBrowser: string,
  rootDir: string,
  stackLocationRegExp: RegExp,
  sessionsForTestFile: TestSession[],
  sourceMapFunction: SourceMapFunction,
) {
  const failedSessions = sessionsForTestFile.filter(s => !s.passed);
  const entries: TerminalEntry[] = [];

  entries.push(...getBrowserLogs(sessionsForTestFile));
  entries.push(...getRequest404s(sessionsForTestFile));
  entries.push(
    ...(await getTestFileErrors(
      allBrowserNames,
      favoriteBrowser,
      sessionsForTestFile,
      rootDir,
      stackLocationRegExp,
      sourceMapFunction,
    )),
  );

  if (failedSessions.length > 0) {
    entries.push(
      ...(await getTestsErrors(
        testFile,
        allBrowserNames,
        favoriteBrowser,
        failedSessions,
        rootDir,
        stackLocationRegExp,
        sourceMapFunction,
      )),
    );
  }

  if (entries.length > 0) {
    entries.unshift('');
    entries.unshift(`${chalk.bold(chalk.cyanBright(relative(process.cwd(), testFile)))}:`);
  }

  return entries;
}
