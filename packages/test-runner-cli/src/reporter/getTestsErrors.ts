import { TestResultError, TestSession } from '@web/test-runner-core';
import chalk from 'chalk';
import * as diff from 'diff';
import { TerminalEntry } from '../Terminal';
import { getFailedOnBrowsers } from '../utils/getFailedOnBrowsers';
import { getErrorLocation } from '../utils/getErrorLocation';
import { formatStackTrace } from '../utils/formatStackTrace';
import { SourceMapFunction } from '../utils/createSourceMapFunction';

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

  if (typeof err.expected === 'string' && typeof err.actual === 'string') {
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
    strings.push(`${chalk.gray('error:')} ${chalk.red(err.message)}`);
    strings.push(renderDiff(err.actual, err.expected));
  } else if (err.stack) {
    strings.push(
      `${chalk.red(
        await formatStackTrace(err, userAgent, rootDir, stackLocationRegExp, sourceMapFunction),
      )}`,
    );
  } else {
    strings.push(chalk.red(err.message ?? 'Unknown error'));
  }

  return strings.join('\n');
}

interface ErrorEntry {
  error: TestResultError;
  userAgent: string;
}

export async function getTestsErrors(
  testFile: string,
  allBrowserNames: string[],
  favoriteBrowser: string,
  failedSessions: TestSession[],
  rootDir: string,
  stackLocationRegExp: RegExp,
  sourceMapFunction: SourceMapFunction,
) {
  const entries: TerminalEntry[] = [];
  const testErrorsPerBrowser = new Map<string, Map<string, ErrorEntry>>();

  for (const session of failedSessions) {
    for (const test of session.tests) {
      if (test.error) {
        let testErrorsForBrowser = testErrorsPerBrowser.get(test.name);
        if (!testErrorsForBrowser) {
          testErrorsForBrowser = new Map<string, ErrorEntry>();
          testErrorsPerBrowser.set(test.name, testErrorsForBrowser);
        }
        testErrorsForBrowser.set(session.browserName, {
          error: test.error!,
          userAgent: session.userAgent!,
        });
      }
    }
  }

  if (testErrorsPerBrowser.size > 0) {
    for (const [name, errorsForBrowser] of testErrorsPerBrowser) {
      const failedBrowsers = Array.from(errorsForBrowser.keys());
      const { error, userAgent } =
        errorsForBrowser.get(favoriteBrowser) ?? errorsForBrowser.get(failedBrowsers[0])!;
      const failedOn = getFailedOnBrowsers(allBrowserNames, failedBrowsers);

      entries.push({ text: `❌ ${name}${failedOn}`, indent: 1 });
      entries.push({
        text: await formatError(error, userAgent, rootDir, stackLocationRegExp, sourceMapFunction),
        indent: 6,
      });
      entries.push('');
    }
  }

  return entries;
}
