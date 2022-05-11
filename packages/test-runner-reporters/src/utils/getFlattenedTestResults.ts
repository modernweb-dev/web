import { TestResult, TestSuiteResult } from '@web/test-runner-core';

export function getFlattenedTestResults(testResults: TestSuiteResult) {
  const flattened: TestResult[] = [];

  function collectTests(prefix: string, tests: TestResult[]) {
    for (const test of tests) {
      flattened.push({ ...test, name: `${prefix}${test.name}` });
    }
  }

  function collectSuite(prefix: string, suite: TestSuiteResult) {
    collectTests(prefix, suite.tests);

    for (const childSuite of suite.suites) {
      const newPrefix = `${prefix}${childSuite.name} > `;
      collectSuite(newPrefix, childSuite);
    }
  }

  collectSuite('', testResults);

  return flattened;
}
