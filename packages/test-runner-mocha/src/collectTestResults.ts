import { TestResult, TestResultError } from '@web/test-runner-browser-lib';
import type { Hook } from 'mocha';

export function collectTestResults(mocha: BrowserMocha) {
  const testResults: TestResult[] = [];
  const hookErrors: TestResultError[] = [];

  function iterateHooks(hooks: Hook[]) {
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

  function iterateTests(prefix: string, tests: Mocha.Test[]) {
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

  function iterateSuite(prefix: string, suite: Mocha.Suite) {
    iterateHooks((suite as any)._beforeAll as Hook[]);
    iterateHooks((suite as any)._afterAll as Hook[]);
    iterateHooks((suite as any)._beforeEach as Hook[]);
    iterateHooks((suite as any)._afterEach as Hook[]);

    iterateTests(prefix, suite.tests);

    for (const childSuite of suite.suites) {
      const newPrefix = `${prefix}${childSuite.title} > `;
      iterateSuite(newPrefix, childSuite);
    }
  }

  iterateSuite('', mocha.suite);

  return { testResults, hookErrors };
}
