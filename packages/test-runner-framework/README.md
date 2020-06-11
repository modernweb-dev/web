# Test Runner Framework

Package used by test frameworks to communicate with the test runner. You could use this package directly from the browser, or use it to implement your own test framework.

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.

## Usage

This package is a browser library that can be used to signal to the test runner. This is a simple example implementation:

```js
import {
  captureConsoleOutput,
  logUncaughtErrors,
  getConfig,
  sessionStarted,
  sessionFinished,
  sessionError,
} from '@web/test-runner-framework';

// optionally capture console and uncaught errors
captureConsoleOutput();
logUncaughtErrors();

(async () => {
  // notify the test runner that we're alive
  sessionStarted();

  // fetch the config for this test run
  const { testFile, debug } = await getConfig();

  const failedImports = [];

  // load the test file, catching errors
  await import(new URL(testFile, document.baseURI).href).catch(error => {
    failedImports.push({ file: testFile, error: { message: error.message, stack: error.stack } });
  });

  // run the actual tests, this would be your implementation
  let testResults;
  try {
    testResults = await runTests();
  } catch (error) {
    sessionError(error);
    return;
  }

  // notify tests run finished
  sessionFinished({
    passed: failedImports.length === 0 && testResults.passed,
    failedImports,
    tests: testResults,
  });
})();
```

Check out [the type declarations](./src/types.ts) for the full interface of the test results.
