import { TestResultError, TestSession, Logger } from '@web/test-runner-core';
import chalk from 'chalk';
import * as diff from 'diff';
import { getFailedOnBrowsers } from '../utils/getFailedOnBrowsers';
import { getErrorLocation } from '../utils/getErrorLocation';
import { formatStackTrace } from '../utils/formatStackTrace';
import { SourceMapFunction } from '../utils/createSourceMapFunction';
import { getFlattenedTestResults } from '../utils/getFlattenedTestResults';

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

export async function formatError(
  err: TestResultError,
  userAgent: string,
  rootDir: string,
  stackLocationRegExp: RegExp,
  sourceMapFunction: SourceMapFunction,
): Promise<string> {
  const strings: string[] = [];
  const errorLocation = await getErrorLocation(
    err,
    userAgent,
    rootDir,
    stackLocationRegExp,
    sourceMapFunction,
  );
  if (errorLocation != null) {
    strings.push(`${chalk.gray('at:')} ${chalk.white(errorLocation)}`);
  }

  if (typeof err.expected === 'string' && typeof err.actual === 'string') {
    strings.push(`${renderDiff(err.actual, err.expected)} \n`);
  }

  if (err.stack) {
    strings.push(
      `${chalk.red(
        await formatStackTrace(err, userAgent, rootDir, stackLocationRegExp, sourceMapFunction),
      )}`,
    );
  }

  if (!err.expected && !err.stack) {
    strings.push(chalk.red(err.message ?? 'Unknown error'));
  }

  return strings.join('\n');
}

interface ErrorEntry {
  error: TestResultError;
  userAgent: string;
}

export async function reportTestsErrors(
  logger: Logger,
  allBrowserNames: string[],
  favoriteBrowser: string,
  failedSessions: TestSession[],
  rootDir: string,
  stackLocationRegExp: RegExp,
  sourceMapFunction: SourceMapFunction,
) {
  const testErrorsPerBrowser = new Map<string, Map<string, ErrorEntry>>();

  for (const session of failedSessions) {
    if (session.testResults) {
      const flattenedTests = getFlattenedTestResults(session.testResults);
      for (const test of flattenedTests) {
        if (test.error) {
          let testErrorsForBrowser = testErrorsPerBrowser.get(test.name);
          if (!testErrorsForBrowser) {
            testErrorsForBrowser = new Map<string, ErrorEntry>();
            testErrorsPerBrowser.set(test.name, testErrorsForBrowser);
          }
          testErrorsForBrowser.set(session.browser.name, {
            error: test.error!,
            userAgent: session.userAgent!,
          });
        }
      }
    }
  }

  if (testErrorsPerBrowser.size > 0) {
    for (const [name, errorsForBrowser] of testErrorsPerBrowser) {
      const failedBrowsers = Array.from(errorsForBrowser.keys());
      const { error, userAgent } =
        errorsForBrowser.get(favoriteBrowser) ?? errorsForBrowser.get(failedBrowsers[0])!;
      const failedOn = getFailedOnBrowsers(allBrowserNames, failedBrowsers);

      logger.log(` ❌ ${name}${failedOn}`);
      logger.group();
      logger.group();
      logger.group();
      logger.log(
        await formatError(error, userAgent, rootDir, stackLocationRegExp, sourceMapFunction),
      );
      logger.groupEnd();
      logger.groupEnd();
      logger.groupEnd();
      logger.log('');
    }
  }
}
