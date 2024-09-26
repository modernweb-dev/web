import type {
  BrowserLauncher,
  Logger,
  Reporter,
  ReporterArgs,
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

  function log(
    logger: Logger,
    name: string,
    passed: boolean,
    skipped: boolean,
    prefix = '  ',
    postfix = '',
  ) {
    const sign = skipped ? dim('-') : passed ? green('✓') : red('𐄂');
    if (flatten) logger.log(`${sign} ${name}${postfix}`);
    else logger.log(`${prefix}  ${sign} ${name}`);
  }

  function logResults(
    logger: Logger,
    results?: TestSuiteResult,
    prefix?: string,
    browser?: BrowserLauncher,
  ) {
    const browserName = browser?.name ? ` ${dim(`[${browser.name}]`)}` : '';
    for (const result of results?.tests ?? []) {
      log(
        logger,
        flatten ? `${prefix ?? ''} ${result.name}` : result.name,
        result.passed,
        result.skipped,
        prefix,
        browserName,
      );
    }

    for (const suite of results?.suites ?? []) {
      logSuite(logger, suite, prefix, browser);
    }
  }

  function logSuite(
    logger: Logger,
    suite: TestSuiteResult,
    parent?: string,
    browser?: BrowserLauncher,
  ) {
    const browserName = browser?.name ? ` ${dim(`[${browser.name}]`)}` : '';
    let pref = parent ? `${parent} ` : ' ';
    if (flatten) pref += `${suite.name}`;
    else logger.log(`${pref}${suite.name}${browserName}`);

    logResults(logger, suite, pref, browser);
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
        logResults(logger, session.testResults, '', session.browser);
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
