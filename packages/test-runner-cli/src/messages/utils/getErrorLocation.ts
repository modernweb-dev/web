import { TestResultError } from '@web/test-runner-core';

const REGEXP_ERROR_LOCATION_BRACKETS = /\((.*)\)/;

function findFirstWord(line: string) {
  for (const maybeWord of line.split(' ')) {
    if (maybeWord !== '') {
      return maybeWord;
    }
  }
}

export function getErrorLocation(err: TestResultError) {
  if (!err.stack) {
    return undefined;
  }

  for (const line of err.stack.split('\n')) {
    // firefox & safari
    if (line.includes('@')) {
      return line.split('@')[1];
    }

    // chromium
    if (findFirstWord(line) === 'at') {
      const match = line.match(REGEXP_ERROR_LOCATION_BRACKETS);
      if (match && match.length >= 2) {
        return match[1];
      }
    }
  }
}
