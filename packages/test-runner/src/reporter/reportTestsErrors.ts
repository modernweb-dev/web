import { TestResultError, TestSession, Logger } from '@web/test-runner-core';
import chalk from 'chalk';
import * as diff from 'diff';

import { getFailedOnBrowsers } from './utils/getFailedOnBrowsers';
import { getFlattenedTestResults } from './utils/getFlattenedTestResults';

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

export function formatError(error: TestResultError) {
  const strings: string[] = [];
  const { name, message = 'Unknown error' } = error;
  const errorMsg = name ? `${name}: ${message}` : message;
  const showDiff = typeof error.expected === 'string' && typeof error.actual === 'string';
  strings.push(chalk.red(errorMsg));

  if (showDiff) {
    strings.push(`${renderDiff(error.actual!, error.expected!)}\n`);
  }

  if (error.stack) {
    if (showDiff) {
      const dedented = error.stack
        .split('\n')
        .map(s => s.trim())
        .join('\n');
      strings.push(chalk.gray(dedented));
    } else {
      strings.push(chalk.gray(error.stack));
    }
  }

  if (!error.expected && !error.stack) {
    strings.push(chalk.red(error.message || 'Unknown error'));
  }

  return strings.join('\n');
}

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
