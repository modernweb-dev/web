# Test Runner >> Reporters >> Write Your Own ||30

A reporter reports test results and/or test progress. It is an object with several hooks which are called during the lifecycle of of the test runner. The actual logging to the terminal is managed by the test run to ensure interaction with the dynamic progress bar and watch menu are managed properly.

The [types in the code](https://github.com/modernweb-dev/web/blob/master/packages/test-runner-core/src/reporter/Reporter.ts) are a good reference documentation. All the callbacks are optional. We recommend making reporting results and progress configurable, so that people can combine multiple reporters.

Example:

```js
export function myReporter({ reportResults = true, reportProgress = false } = {}) {
  return {
    /**
     * Called once when the test runner starts.
     */
    start({ config, sessions, testFiles, browserNames, startTime }) {},

    /**
     * Called once when the test runner stops. This can be used to write a test
     * report to disk for regular test runs.
     */
    stop({ sessions, testCoverage, focusedTestFile }) {},

    /**
     * Called when a test run starts. Each file change in watch mode
     * triggers a test run.
     *
     * @param testRun the test run
     */
    onTestRunStarted({ testRun }) {},

    /**
     * Called when a test run is finished. Each file change in watch mode
     * triggers a test run. This can be used to report the end of a test run,
     * or to write a test report to disk in watch mode for each test run.
     *
     * @param testRun the test run
     */
    onTestRunFinished({ testRun, sessions, testCoverage, focusedTestFile }) {},

    /**
     * Called when results for a test file can be reported. This is called
     * when all browsers for a test file are finished, or when switching between
     * menus in watch mode.
     *
     * If your test results are calculated async, you should return a promise from
     * this function and use the logger to log test results. The test runner will
     * guard against race conditions when re-running tests in watch mode while reporting.
     *
     * @param logger the logger to use for logging tests
     * @param testFile the test file to report for
     * @param sessionsForTestFile the sessions for this test file. each browser is a
     * different session
     */
    async reportTestFileResults({ logger, sessionsForTestFile, testFile }) {
      if (!reportResults) {
        return;
      }

      // test report generated async
      const testReport = await generateTestReport(testFile, sessionsForTestFile);

      logger.log(`Results for ${testFile}`);
      logger.group();
      logger.log(testReport);
      logger.groupEnd();
    },

    /**
     * Called when test progress should be rendered to the terminal. This is called
     * any time there is a change in the test runner to display the latest status.
     *
     * This function should return the test report as a string. Previous results from this
     * function are overwritten each time it is called, they are rendered "dynamically"
     * to the terminal so that the progress bar is live updating.
     */
    getTestProgress({
      config,
      sessions,
      testFiles,
      startTime,
      testRun,
      focusedTestFile,
      testCoverage,
    }) {
      if (!reportProgress) {
        return;
      }

      return `Current progress: 21%`;
    },
  };
}
```
