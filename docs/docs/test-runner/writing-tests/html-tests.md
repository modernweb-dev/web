# Test Runner >> Writing Tests >> HTML Tests ||20

HTML files are loaded in the browser as is, and are not processed by a test framework. This way you have full control over the test environment. Depending on which test framework you're using, the way you run your tests can be a little different.

With mocha, you need to define your tests inside the `runTests` function:

```html
<html>
  <body>
    <script type="module">
      import { runTests } from '@web/test-runner-mocha';
      import { expect } from '@esm-bundle/chai';

      runTests(async () => {
        // write your tests inline
        describe('HTML tests', () => {
          it('works', () => {
            expect('foo').to.equal('foo');
          });
        });

        // or import your test file
        await import('./my-test.js');
      });
    </script>
  </body>
</html>
```

You can also go completely bare bones and not use any test framework. In this case you are responsible for pinging back to the test runner yourself:

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
