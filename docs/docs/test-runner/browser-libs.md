---
title: Test Runner Browser Lib
eleventyNavigation:
  key: Browser Lib
  parent: Test Runner
---

Browser library to communicate with the test runner.

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.

## Usage

For a simple setup, you can use this library directly in your project and avoid using a testing framework.

You can also use this as a wrapper around an existing testing framework. To kick off the test execution and report the results back. See [@web/test-runner-mocha](./mocha.md) as an example of that.

### JS tests

This is a simple example implementation for JS tests:

```js
import {
  captureConsoleOutput,
  logUncaughtErrors,
  getConfig,
  sessionStarted,
  sessionFinished,
  sessionError,
} from '@web/test-runner-browser-lib';

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

  try {
    // run the actual tests, this is what you will implement
    const testResults = await runTests();

    // notify tests run finished
    sessionFinished({
      passed: failedImports.length === 0 && testResults.passed,
      failedImports,
      tests: testResults,
    });
  } catch (error) {
    // notify an error occurred
    sessionError(error);
    return;
  }
})();
```

### HTML tests

If you want to use this library directly in a HTML test, you can do something like this:

```html
<html>
  <body>
    <script type="module">
      import {
        captureConsoleOutput,
        logUncaughtErrors,
        sessionStarted,
        sessionFinished,
        sessionError,
      } from '@web/test-runner-browser-lib';
      // optionally capture console and uncaught errors
      captureConsoleOutput();
      logUncaughtErrors();
      // notify the test runner that we're alive
      sessionStarted();

      try {
        // run the actual tests, this is what you will implement
        const testResults = await runTests();

        // notify tests run finished
        sessionFinished({
          passed: testResults.passed,
          failedImports,
          tests: testResults,
        });
      } catch (error) {
        // notify an error occurred
        sessionError(error);
        return;
      }
    </script>
  </body>
</html>
```

## Types

Check out [the type declarations](./src/types.ts) for the full interface of the test results.
