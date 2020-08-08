---
title: Test frameworks
eleventyNavigation:
  key: Test Frameworks
  parent: Test Runner
  order: 4
---

Test frameworks load and run your tests in the browser, and provide the framework needed to define your tests.

You can use any test framework with web test runner, but it does require a small wrapper around the framework to communicate the test results from the browser back to the test runner. Right now we only have a test framework implementation for Mocha, which is used by default in the test runner.

Check out the [docs for Mocha](./mocha.md).

## Implementing a test framework

Implementing a test framework is straightforward, you can wrap an existing framework or create a simple one specific for your project.

This is a minimal example:

```js
import {
  getConfig,
  sessionStarted,
  sessionFinished,
  sessionFailed,
} from '@web/test-runner-core/browser/session.js';

(async () => {
  // notify the test runner that we're alive
  sessionStarted();

  // fetch the config for this test run, this will tell you which file we're testing
  const { testFile, watch, debug, testFrameworkConfig } = await getConfig();
  const failedImports = [];

  // load the test file as an es module
  await import(new URL(testFile, document.baseURI).href).catch(error => {
    failedImports.push({ file: testFile, error: { message: error.message, stack: error.stack } });
  });

  try {
    // run the actual tests, this is what you need to implement
    const testResults = await runTests();

    // notify tests run finished
    sessionFinished({
      passed: failedImports.length === 0 && testResults.passed,
      failedImports,
      testResults,
    });
  } catch (error) {
    // notify an error occurred
    sessionFailed(error);
    return;
  }
})();
```
