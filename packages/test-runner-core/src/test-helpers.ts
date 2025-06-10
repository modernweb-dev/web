/* eslint-disable no-async-promise-executor, no-inner-declarations */
import { getPortPromise } from 'portfinder';
import path from 'path';
import { TestRunner, TestRunnerCoreConfig } from './index.js';
import { Logger } from './logger/Logger.js';
import { TestResult, TestSession, TestSuiteResult } from './test-session/TestSession.js';
import { SESSION_STATUS } from './test-session/TestSessionStatus.js';
import { TestRunnerGroupConfig } from './config/TestRunnerGroupConfig.js';

const logger: Logger = {
  ...console,
  debug() {
    //
  },
  logSyntaxError(error) {
    console.error(error);
  },
};

const secondMs = 1000;
const minuteMs = secondMs * 60;

const defaultBaseConfig: Partial<TestRunnerCoreConfig> = {
  watch: false,
  rootDir: path.join(__dirname, '..', '..', '..'),
  testFramework: {
    path: require.resolve('@web/test-runner-mocha/dist/autorun.js'),
  },
  protocol: 'http:',
  hostname: 'localhost',
  reporters: [],
  concurrentBrowsers: 2,
  concurrency: 10,
  browserStartTimeout: minuteMs / 2,
  testsStartTimeout: secondMs * 20,
  testsFinishTimeout: minuteMs * 2,
  browserLogs: true,
  logger,
};

export async function runTests(
  config: Partial<TestRunnerCoreConfig>,
  groupConfigs?: TestRunnerGroupConfig[],
  {
    allowFailure = false,
    reportErrors = true,
  }: { allowFailure?: boolean; reportErrors?: boolean } = {},
): Promise<{ runner: TestRunner; sessions: TestSession[] }> {
  return new Promise(async (resolve, reject) => {
    const port = await getPortPromise({ port: 9000 + Math.floor(Math.random() * 1000) });
    const finalConfig = {
      port,
      ...defaultBaseConfig,
      ...config,
      testFramework: {
        ...defaultBaseConfig.testFramework,
        ...config.testFramework,
      },
    } as TestRunnerCoreConfig;

    const runner = new TestRunner(finalConfig, groupConfigs);

    let finished = false;

    runner.on('test-run-finished', ({ testRun, testCoverage }) => {
      for (const reporter of finalConfig.reporters) {
        reporter.onTestRunFinished?.({
          testRun,
          sessions: Array.from(runner.sessions.all()),
          testCoverage,
          focusedTestFile: runner.focusedTestFile,
        });
      }
    });

    runner.on('finished', async () => {
      for (const reporter of finalConfig.reporters) {
        await reporter.stop?.({
          sessions: Array.from(runner.sessions.all()),
          focusedTestFile: runner.focusedTestFile,
        });
      }
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

      if (reportErrors) {
        for (const session of sessions) {
          if (!session.passed || session.request404s.length > 0) {
            console.log('');
            console.log(
              'Failed test file:',
              session.browser.name,
              path.relative(process.cwd(), session.testFile),
            );
          }

          for (const log of session.logs) {
            if (log.length !== 0) {
              console.log(
                '[Browser log]',
                ...log.map(l => (l.__WTR_BROWSER_ERROR__ ? l.stack : l)),
              );
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
      }

      if (!sessions.every(s => s.status === SESSION_STATUS.FINISHED)) {
        reject(new Error('Tests did not finish'));
        return;
      }

      if (allowFailure || passed) {
        resolve({ runner, sessions });
      } else {
        reject(new Error('Test run did not pass'));
      }
    });

    runner.start();
  });
}
