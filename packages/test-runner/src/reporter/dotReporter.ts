import type { Reporter, ReporterArgs, TestSuiteResult } from '@web/test-runner-core';

import { reportTestsErrors } from './reportTestsErrors.js';
import { reportTestFileErrors } from './reportTestFileErrors.js';

import { TestRunnerLogger } from '../logger/TestRunnerLogger.js';

const color =
  ([x, y]: [number, number]) =>
  (z: string) =>
    `\x1b[${x}m${z}\x1b[${y}m${reset}`;
const reset = `\x1b[0m\x1b[0m`;
const red = color([31, 89]);

/** Test reporter that summarizes all test for a given run using dot notation */
export function dotReporter(): Reporter {
  let args: ReporterArgs;
  let favoriteBrowser: string;

  const logger = new TestRunnerLogger();

  function log(passed: boolean) {
    logger.log(passed ? '.' : red('x'));
  }

  function logResults(results?: TestSuiteResult) {
    for (const result of results?.tests ?? []) {
      log(result.passed);
    }

    for (const suite of results?.suites ?? []) {
      logSuite(suite);
    }
  }

  function logSuite(suite: TestSuiteResult) {
    logResults(suite);
  }

  return {
    start(_args) {
      args = _args;
      favoriteBrowser =
        args.browserNames.find(name => {
          const n = name.toLowerCase();
          return n.includes('chrome') || n.includes('chromium') || n.includes('firefox');
        }) ?? args.browserNames[0];
    },

    reportTestFileResults({ sessionsForTestFile: sessions }) {
      for (const session of sessions) {
        logResults(session.testResults);
      }
    },

    onTestRunFinished({ sessions }) {
      const failedSessions = sessions.filter(s => !s.passed);
      if (failedSessions.length > 0) {
        logger.log('\n\nErrors Reported in Tests:\n\n');
        reportTestsErrors(logger, args.browserNames, favoriteBrowser, failedSessions);
        reportTestFileErrors(logger, args.browserNames, favoriteBrowser, failedSessions, true);
      }
    },
  };
}
