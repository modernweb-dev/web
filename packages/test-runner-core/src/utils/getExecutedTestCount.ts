import { type TestSuiteResult } from '../test-session/TestSession.js';

/**
 * Counts the tests executed as part of a test result tree, including
 * skipped tests.
 */
export function getExecutedTestCount(testResults: TestSuiteResult): number {
  let count = testResults.tests.length;

  for (const childSuite of testResults.suites) {
    count += getExecutedTestCount(childSuite);
  }

  return count;
}
