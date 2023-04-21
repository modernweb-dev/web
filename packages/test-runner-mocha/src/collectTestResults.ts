import {
  TestResult,
  TestSuiteResult,
  TestResultError,
} from '../../test-runner-core/browser/session.js';
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
          const stackArray = hookError.stack?.split('\n') ?? [];
          hookErrors.push({
            name: hookError.name,
            message: hookError.message,
            stack: stackArray.join('\n'),
          });
        } else {
          hookErrors.push({ message: 'Unknown error in mocha hook' });
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
        ...(test.duration !== undefined && { duration: test.duration }),
        error: err
          ? {
              name: err.name,
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
