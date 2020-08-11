/* eslint-disable no-async-promise-executor, no-inner-declarations */
import { getPortPromise } from 'portfinder';
import path from 'path';
import { TestRunner, TestRunnerCoreConfig } from './index';
import { Logger } from './logger/Logger';
import { TestResult, TestSuiteResult } from './test-session/TestSession';
import { SESSION_STATUS } from './test-session/TestSessionStatus';

const logger: Logger = {
  ...console,
  debug() {
    //
  },
  logSyntaxError(error) {
    console.error(error);
  },
};

const defaultBaseConfig: Partial<TestRunnerCoreConfig> = {
  watch: false,
  rootDir: path.join(__dirname, '..', '..', '..'),
  testFramework: {
    path: require.resolve('@web/test-runner-mocha/dist/autorun.js'),
  },
  protocol: 'http:',
  hostname: 'localhost',
  reporters: [],
  concurrency: 10,
  browserStartTimeout: 30000,
  testsStartTimeout: 10000,
  testsFinishTimeout: 20000,
  logBrowserLogs: true,
  logUncaughtErrors: true,
  logger,
};

export async function runTests(config: Partial<TestRunnerCoreConfig>, testFiles: string[]) {
  return new Promise(async (resolve, reject) => {
    const port = await getPortPromise({ port: 9000 + Math.floor(Math.random() * 1000) });
    const finalConfig = {
      port,
      ...defaultBaseConfig,
      ...config,
    } as TestRunnerCoreConfig;

    const runner = new TestRunner(finalConfig, testFiles);

    // runner.sessions.on('session-status-updated', session => {
    //   console.log(session.browser.name, session.id, session.status);
    // });

    let finished = false;
    runner.on('finished', () => {
      finished = true;
      runner.stop();
    });

    setTimeout(() => {
      finished = true;
      if (!finished) {
        runner.stop();
      }
    }, 20000);

    runner.on('stopped', passed => {
      const sessions = Array.from(runner.sessions.all());

      for (const session of sessions) {
        if (
          !session.passed ||
          session.logs.some(l => l.length > 0) ||
          session.request404s.length > 0
        ) {
          console.log('');
          console.log(
            'Failed test file:',
            session.browser.name,
            path.relative(process.cwd(), session.testFile),
          );
        }

        for (const log of session.logs) {
          if (log.length !== 0) {
            console.log('[Browser log]', ...log.map(l => (l.__WTR_BROWSER_ERROR__ ? l.stack : l)));
          }
        }

        for (const request404 of session.request404s) {
          console.log('[Request 404]', request404);
        }

        if (!session.passed) {
          for (const error of session.errors) {
            console.error(error.stack ?? error.message);
          }

          function iterateTests(tests: TestResult[]) {
            for (const test of tests) {
              if (!test.passed) {
                console.log(test.name, test.error?.stack ?? test.error?.message);
              }
            }
          }

          function iterateSuite(suite: TestSuiteResult) {
            iterateTests(suite.tests);

            for (const s of suite.suites) {
              iterateSuite(s);
            }
          }

          if (session.testResults) {
            iterateSuite(session.testResults);
          }
        }
      }

      if (!sessions.every(s => s.status === SESSION_STATUS.FINISHED)) {
        reject(new Error('Tests did not finish'));
        return;
      }

      if (passed) {
        resolve(runner);
      } else {
        reject(new Error('Test run did not pass'));
      }
    });

    runner.start();
  });
}
