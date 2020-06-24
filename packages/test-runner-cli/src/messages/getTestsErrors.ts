import { TestResultError, TestSession } from '@web/test-runner-core';
import { TerminalEntry } from '../Terminal';
import { getFailedOnBrowsers } from './utils/getFailedOnBrowsers';
import chalk from 'chalk';
import * as diff from 'diff';
import { getErrorLocation } from './utils/getErrorLocation';
import { formatStackTrace } from './utils/formatStackTrace';

function renderDiff(actual: string, expected: string) {
  function cleanUp(line: string) {
    if (line[0] === '+') {
      return chalk.green(line);
    }
    if (line[0] === '-') {
      return chalk.red(line);
    }
    if (line.match(/@@/)) {
      return null;
    }
    if (line.match(/\\ No newline/)) {
      return null;
    }
    return line;
  }

  const diffMsg = diff
    .createPatch('string', actual, expected)
    .split('\n')
    .splice(4)
    .map(cleanUp)
    .filter(l => !!l)
    .join('\n');

  return `${chalk.green('+ expected')} ${chalk.red('- actual')}\n\n${diffMsg}`;
}

export function formatError(err: TestResultError, serverAddress: RegExp): string {
  const strings: string[] = [];

  if (typeof err.expected === 'string' && typeof err.actual === 'string') {
    const errorLocation = getErrorLocation(err);
    if (errorLocation != null) {
      strings.push(`${chalk.gray('at:')} ${chalk.white(errorLocation)}`);
    }
    strings.push(`${chalk.gray('error:')} ${chalk.red(err.message)}`);
    strings.push(renderDiff(err.actual, err.expected));
  } else if (err.stack) {
    strings.push(`${chalk.red(formatStackTrace(err, serverAddress))}`);
  } else {
    strings.push(chalk.red(err.message ?? 'Unknown error'));
  }

  return strings.join('\n');
}

export function getTestsErrors(
  testFile: string,
  allBrowserNames: string[],
  favoriteBrowser: string,
  failedSessions: TestSession[],
  serverAddressRegExp: RegExp,
) {
  const entries: TerminalEntry[] = [];
  const testErrorsPerBrowser = new Map<string, Map<string, TestResultError>>();

  for (const session of failedSessions) {
    for (const test of session.tests) {
      if (test.error) {
        let testErrorsForBrowser = testErrorsPerBrowser.get(test.name);
        if (!testErrorsForBrowser) {
          testErrorsForBrowser = new Map<string, TestResultError>();
          testErrorsPerBrowser.set(test.name, testErrorsForBrowser);
        }
        testErrorsForBrowser.set(session.browserName, test.error!);
      }
    }
  }

  if (testErrorsPerBrowser.size > 0) {
    for (const [name, errorsForBrowser] of testErrorsPerBrowser) {
      const failedBrowsers = Array.from(errorsForBrowser.keys());
      const favoriteError =
        errorsForBrowser.get(favoriteBrowser) ?? errorsForBrowser.get(failedBrowsers[0])!;
      const failedOn = getFailedOnBrowsers(allBrowserNames, failedBrowsers);

      entries.push({ text: `❌ ${name}${failedOn}`, indent: 1 });
      entries.push({ text: formatError(favoriteError, serverAddressRegExp), indent: 6 });
      entries.push('');
    }
  }

  return entries;
}
