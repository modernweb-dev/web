import { TestSession, BufferedLogger } from '@web/test-runner-core';
import { bold, cyan } from 'nanocolors';
import { relative } from 'path';

import { reportTestsErrors } from './reportTestsErrors.js';
import { reportBrowserLogs } from './reportBrowserLogs.js';
import { reportRequest404s } from './reportRequest404s.js';
import { reportTestFileErrors } from './reportTestFileErrors.js';

export function reportTestFileResults(
  logger: BufferedLogger,
  testFile: string,
  allBrowserNames: string[],
  favoriteBrowser: string,
  sessionsForTestFile: TestSession[],
) {
  const failedSessions = sessionsForTestFile.filter(s => !s.passed);

  reportBrowserLogs(logger, sessionsForTestFile);
  reportRequest404s(logger, sessionsForTestFile);
  reportTestFileErrors(logger, allBrowserNames, favoriteBrowser, sessionsForTestFile);

  if (failedSessions.length > 0) {
    reportTestsErrors(logger, allBrowserNames, favoriteBrowser, failedSessions);
  }

  if (logger.buffer.length > 0) {
    logger.buffer.unshift({
      method: 'log',
      args: [`${bold(cyan(relative(process.cwd(), testFile)))}:\n`],
    });
  }
}
