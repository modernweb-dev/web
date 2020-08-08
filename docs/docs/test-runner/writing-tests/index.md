---
title: Writing tests
eleventyNavigation:
  key: Writing tests
  parent: Test Runner
  order: 3
---

Web test runners reads the configured test files, and runs them inside each of the configured browsers. Each test file runs in it's own browser environment, there is no shared state between tests. This enables concurrency and keeps tests isolated.

## JS tests

Javascript files are loaded by the test framework that is configured. The default test framework is mocha, which loads your test as a standard browser es module. You can use module imports to import your code and any modules you want to use for testing.

For example:

```js
import { expect } from '@bundled-es-modules/chai';
import { myFunction } from '../src/myFunction.js';

describe('myFunction', () => {
  it('adds two numbers together', () => {
    expect(myFunction(1, 2)).to.equal(3);
  });
});
```

See the [Test frameworks](../test-frameworks/index.md) and [es modules](../../../learn/standards-based/es-modules.md) sections for more information.

## HTML tests

HTML files are loaded in the browser as is, and are not processed by a test framework. This way you have full control over the test environment, but you have the responsibility to ping the test runner that tests have finished running.

With mocha, there are some helper functions you can use for this:

```html
<html>
  <body>
    <script type="module">
      import { mocha, sessionFinished, sessionFailed } from '@web/test-runner-mocha';

      try {
        // setup mocha
        mocha.setup({ ui: 'bdd' });

        // write your tests inline
        describe('HTML tests', () => {
          it('works', () => {
            expect('foo').to.equal('foo');
          });
        });

        // or import your test file
        await import('./my-test.js');

        // run the tests, and notify the test runner after finishing
        mocha.run(() => {
          sessionFinished();
        });
      } catch (error) {
        console.error(error);
        // notify the test runner about errors
        sessionFailed(error);
      }
    </script>
  </body>
</html>
```

You can also go completely barebones and not use any test framework:

```html
<html>
  <body>
    <script type="module">
      import {
        sessionStarted,
        sessionFinished,
        sessionFailed,
      } from '@web/test-runner-core/browser/session.js';

      try {
        // notify the test runner that we're alive
        sessionStarted();

        // run the actual tests, this is what you need to implement
        const testResults = await runTests();

        // notify tests run finished
        sessionFinished({
          // whether the test run passed
          passed: testResults.passed,
          // the test results
          testResults,
        });
      } catch (error) {
        // notify an error occurred
        sessionFailed(error);
        return;
      }
    </script>
  </body>
</html>
```
