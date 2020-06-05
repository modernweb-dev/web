import { TestResultError } from '@web/test-runner-core';
import chalk from 'chalk';
import * as diff from 'diff';
import { getErrorLocation } from './getErrorLocation';

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

export function formatError(err: TestResultError): string {
  const errorLocation = getErrorLocation(err);
  let errorString =
    errorLocation != null ? `${chalk.gray('at:')} ${chalk.white(errorLocation)}\n` : '';

  if (typeof err.expected === 'string' && typeof err.actual === 'string') {
    errorString += `${chalk.gray('error:')} ${chalk.red(err.message)}\n${renderDiff(
      err.actual,
      err.expected,
    )}`;
  } else {
    errorString +=
      errorLocation || !err.stack
        ? `${chalk.gray('error:')} ${chalk.red(err.message)}`
        : `${chalk.red(err.stack)}`;
  }

  return errorString;
}
