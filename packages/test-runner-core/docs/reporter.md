# Reporter

A reporter reports test results and/or test progress. It is an object with several hooks which are called during the lifecycle of of the test runner. The actual logging to the terminal is managed by the test run to ensure interaction with the dynamic progress bar and watch menu are managed properly.

The [types in the code](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-core/src/reporter/Reporter.ts) are a good reference documentation. All the callbacks are optional. We recommend making reporting results and progress configurable, so that people can combine multiple reporters.

Example:

```js
export function myReporter({ reportResults = true, reportProgress = false } = {}) {
  return {
    /**
     * Called once when the test runner starts.
     */
    start({ config, sessions, testFiles, browserNames, startTime }) {},

    /**
     * Called once when the test runner stops.
     */
    stop() {},

    /**
     * Called when a test run starts. Each file change in watch mode
     * triggers a test run.
     *
     * @param testRun the test run
     */
    onTestRunStarted({ testRun }) {},

    /**
     * Called when a test run is finished. Each file change in watch mode
     * triggers a test run.
     *
     * @param testRun the test run
     */
    onTestRunFinished({ testRun }) {},

    /**
     * Called when results for a test file can be reported. This is called
     * when all browsers for a test file are finished, or when switching between
     * menus in watch mode.
     *
     * This function should return the test report, which is an array of strings or
     * objects indication report indentation.
     *
     * @param testFile the test file to report for
     * @param sessionsForTestFile the sessions for this test file. each browser is a
     * different session
     */
    async reportTestFileResult({ sessionsForTestFile, testFile }) {
      if (!reportResults) {
        return;
      }

      return [
        'Hello world',
        { indent: 2, text: 'This is an indented message' },
        'Lorem ipsum',
        { indent: 4, text: 'foo bar' },
      ];
    },

    /**
     * Called when test progress should be rendered to the terminal. This is called
     * any time there is a change in the test runner to display the latest status.
     *
     * This function should return the test report, which is an array of strings or
     * objects indication report indentation. Previous results from this function are
     * overwritten each time it is called, they are rendered "dynamically" to the terminal
     * so that the progress bar is live updating.
     */
    reportTestProgress({ testRun, focusedTestFile, testCoverage }) {
      if (!reportProgress) {
        return;
      }
    },
  };
}
```
