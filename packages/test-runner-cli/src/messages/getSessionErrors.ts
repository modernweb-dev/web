import { TestSession, TestResultError } from '@web/test-runner-core';
import { TerminalEntry } from '../Terminal';
import { formatError } from './utils/formatError';
import { getFailedOnBrowsers } from './utils/getFailedOnBrowsers';

function isSameError(a: TestResultError, b: TestResultError) {
  return a.message === b.message && a.stack === b.stack;
}

export function getSessionErrors(sessions: TestSession[]) {
  const entries: TerminalEntry[] = [];
  const sessionsWithError = sessions.filter(s => !!s.error);
  if (sessionsWithError.length === 0) {
    return entries;
  }

  const allSameError = sessionsWithError.every(e =>
    isSameError(e.error!, sessionsWithError[0].error!),
  );

  if (allSameError) {
    const browserNames = sessions.map(s => s.browserName);
    const failedBrowserNames = sessionsWithError.map(s => s.browserName);

    entries.push({
      text: `❌ Failed to run test file${getFailedOnBrowsers(
        browserNames,
        failedBrowserNames,
        false,
      )}:`,
      indent: 1,
    });
    entries.push({
      text: formatError(sessionsWithError[0].error!),
      indent: 6,
    });
    entries.push('');
    return entries;
  }

  // only some browsers have an error, or each browser has a different error
  for (const session of sessionsWithError) {
    entries.push({
      text: `❌ Failed to run test file ${session.browserName}:`,
      indent: 1,
    });
    entries.push({
      text: formatError(session.error!),
      indent: 6,
    });
    entries.push('');
  }
  return entries;
}
