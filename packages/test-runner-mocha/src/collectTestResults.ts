import {
  TestResult,
  TestSuiteResult,
  TestResultError,
} from '../../test-runner-browser-lib/dist/index.js';
// type only import, has to be a bare import
import { Hook } from 'mocha';

export function collectTestResults(mocha: BrowserMocha) {
  const hookErrors: TestResultError[] = [];
  let passed = true;

  function collectHooks(hooks: Hook[]) {
    for (const hook of hooks) {
      const hookError = (hook as any).err as Error | undefined;
      if (hook.state === 'failed' || hookError) {
        if (hookError) {
          const message = hook.title;
          const stackArray = hookError.stack?.split('\n') ?? [];
          if (!stackArray[0].includes(hookError.message)) {
            stackArray?.unshift(hookError.message);
          }
          hookErrors.push({ message, stack: stackArray.join('\n') });
        } else {
          hookErrors.push({ message: 'Unknown error' });
        }
      }
    }
  }

  function getTestResults(tests: Mocha.Test[]) {
    const testResults: TestResult[] = [];
    for (const test of tests) {
      if (!test.isPassed() && !test.isPending()) {
        passed = false;
      }
      const err = test.err as Error & { actual?: string; expected?: string };
      testResults.push({
        name: test.title,
        passed: test.isPassed(),
        skipped: test.isPending(),
        duration: test.duration,
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
    return testResults;
  }

  function getSuiteResults(suite: Mocha.Suite): TestSuiteResult {
    collectHooks((suite as any)._beforeAll as Hook[]);
    collectHooks((suite as any)._afterAll as Hook[]);
    collectHooks((suite as any)._beforeEach as Hook[]);
    collectHooks((suite as any)._afterEach as Hook[]);

    const suites = suite.suites.map(s => getSuiteResults(s));
    const tests = getTestResults(suite.tests);

    return { name: suite.title, suites, tests };
  }

  const testResults = getSuiteResults(mocha.suite);

  return { testResults, hookErrors, passed };
}
