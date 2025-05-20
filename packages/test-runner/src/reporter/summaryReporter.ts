import type {
  Logger,
  Reporter,
  ReporterArgs,
  TestSession,
  TestSuiteResult,
} from '@web/test-runner-core';

import { reportTestsErrors } from './reportTestsErrors.js';
import { reportTestFileErrors } from './reportTestFileErrors.js';

import { reportBrowserLogs } from './reportBrowserLogs.js';

interface Options {
  flatten?: boolean;
}

const color =
  ([x, y]: [number, number]) =>
    (z: string) =>
      `\x1b[${x}m${z}\x1b[${y}m${reset}`;
const reset = `\x1b[0m\x1b[0m`;
const green = color([32, 89]);
const red = color([31, 89]);
const dim = color([2, 0]);

/** Test reporter that summarizes all test for a given run */
export function summaryReporter(opts: Options): Reporter {
  const { flatten = false } = opts ?? {};
  let args: ReporterArgs;
  let favoriteBrowser: string;

  function logTest(
    logger: Logger,
    name: string,
    passed: boolean,
    skipped: boolean,
    prefix: string,
    postfix = '',
  ) {
    const sign = skipped ? dim('-') : passed ? green('✓') : red('𐄂');
    if (flatten) logger.log(`${sign} ${name}${postfix}`);
    else logger.log(`${prefix} ${sign} ${name}`);
  }

  function logSuite(
    logger: Logger,
    suite: TestSuiteResult,
    parent: string,
    browserName: string,
  ) {
    let prefix = parent ?? '';
    if (flatten) prefix += `${suite.name}`;
    else logger.log(`${prefix}${suite.name}${!parent ? browserName : ''}`);

    for (const test of suite.tests ?? []) {
      logTest(
        logger,
        flatten && prefix ? `${prefix} ${test.name}` : test.name,
        test.passed,
        test.skipped,
        prefix,
        browserName,
      );
    }

    if (!flatten || prefix) prefix += ' '
    for (const childSuite of suite.suites ?? []) {
      logSuite(logger, childSuite, prefix, browserName);
    }
  }

  function logResults(
    logger: Logger,
    session: TestSession,
  ) {
    if (session.testResults) {
      const browserName = session.browser?.name ? ` ${dim(`[${session.browser.name}]`)}` : '';
      const suite = session.testResults;

      if (suite.suites.length || suite.tests.length) {
        logSuite(logger, suite, '', browserName);
      } else {
        logger.log(`No tests on ${session.testFile}${browserName}`);
      }
    }
  }

  let cachedLogger: Logger;
  return {
    start(_args) {
      args = _args;
      favoriteBrowser =
        args.browserNames.find(name => {
          const n = name.toLowerCase();
          return n.includes('chrome') || n.includes('chromium') || n.includes('firefox');
        }) ?? args.browserNames[0];
    },

    reportTestFileResults({ logger, sessionsForTestFile }) {
      cachedLogger = logger;
      for (const session of sessionsForTestFile) {
        logResults(logger, session);
        logger.log('');
      }
      reportBrowserLogs(logger, sessionsForTestFile);
    },

    onTestRunFinished({ sessions }) {
      const failedSessions = sessions.filter(s => !s.passed);
      if (failedSessions.length > 0) {
        cachedLogger.log('\n\nErrors Reported in Tests:\n\n');
        reportTestsErrors(cachedLogger, args.browserNames, favoriteBrowser, failedSessions);
        reportTestFileErrors(
          cachedLogger,
          args.browserNames,
          favoriteBrowser,
          failedSessions,
          true,
        );
      }
    },
  };
}
