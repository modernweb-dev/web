import { TestResult, TestSuiteResult } from '@web/test-runner-core';

export function getPassedFailedSkippedCount(testResults: TestSuiteResult) {
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  function collectTests(tests: TestResult[]) {
    for (const test of tests) {
      if (test.skipped) {
        skipped += 1;
      } else if (test.passed) {
        passed += 1;
      } else {
        failed += 1;
      }
    }
  }

  function collectSuite(suite: TestSuiteResult) {
    collectTests(suite.tests);

    for (const childSuite of suite.suites) {
      collectSuite(childSuite);
    }
  }

  collectSuite(testResults);

  return { passed, failed, skipped };
}
