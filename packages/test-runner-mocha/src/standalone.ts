import {
  sessionFinished,
  captureConsoleOutput,
  logUncaughtErrors,
  sessionStarted,
  TestResult,
} from '@web/test-runner-browser-lib';
import 'mocha/mocha.js';

captureConsoleOutput();
logUncaughtErrors();
sessionStarted();

mocha.setup({ ui: 'bdd', reporter: 'spec', allowUncaught: false });

export function runTests() {
  mocha.run(failures => {
    // setTimeout to wait for event loop to unwind and collect all logs
    setTimeout(() => {
      const testResults: TestResult[] = [];

      function collectTests(prefix: string, tests: Mocha.Test[]) {
        for (const test of tests) {
          // add test if it isn't pending (skipped)
          if (!test.isPending()) {
            const name = `${prefix}${test.title}`;
            const err = test.err as Error & { actual?: string; expected?: string };
            testResults.push({
              name,
              passed: test.isPassed(),
              error: err
                ? {
                    message: err.message,
                    stack: err.stack,
                    expected: err.expected,
                    actual: err.actual,
                  }
                : undefined,
            });
          }
        }
      }

      function collectSuite(prefix: string, suite: Mocha.Suite) {
        collectTests(prefix, suite.tests);

        for (const childSuite of suite.suites) {
          const newPrefix = `${prefix}${childSuite.title} > `;
          collectSuite(newPrefix, childSuite);
        }
      }

      collectSuite('', mocha.suite);

      sessionFinished({
        passed: failures === 0,
        failedImports: [],
        tests: testResults,
      });
    });
  });
}
