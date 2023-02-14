import { gray, green, red } from 'nanocolors';
import * as diff from 'diff';

function renderDiff(actual: string, expected: string) {
  function cleanUp(line: string) {
    if (line[0] === '+') {
      return green(line);
    }
    if (line[0] === '-') {
      return red(line);
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

  return `${green('+ expected')} ${red('- actual')}\n\n${diffMsg}`;
}

interface TestResultError {
  name?: string | undefined;
  message: string | undefined;
  stack?: string | undefined;
  actual?: string | undefined;
  expected?: string | undefined;
}

export function formatError(error: TestResultError) {
  const strings: string[] = [];
  const { name, message = 'Unknown error' } = error;
  const errorMsg = name ? `${name}: ${message}` : message;
  const showDiff = typeof error.expected === 'string' && typeof error.actual === 'string';
  strings.push(red(errorMsg));

  if (showDiff) {
    strings.push(`${renderDiff(error.actual!, error.expected!)}\n`);
  }

  if (error.stack) {
    if (showDiff) {
      const dedented = error.stack
        .split('\n')
        .map(s => s.trim())
        .join('\n');
      strings.push(gray(dedented));
    } else {
      strings.push(gray(error.stack));
    }
  }

  if (!error.expected && !error.stack) {
    strings.push(red(error.message || 'Unknown error'));
  }

  return strings.join('\n');
}
