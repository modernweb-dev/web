# Test Runner >> Test Frameworks >> Mocha ||10

Test framework implementation of [Mocha](https://mochajs.org/).

## Writing JS tests

Mocha relies on global variables, in any JS test file `describe` and `it` are available globally and can be used directly:

```js
describe('my test', () => {
  it('foo is bar', () => {
    if ('foo' !== 'bar') {
      throw new Error('foo does not equal bar');
    }
  });
});
```

## Writing HTML tests

If you're writing tests as HTML, you can import this library to run tests with mocha:

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

## Configuring mocha options

You can configure browser Mocha options using the `testFramework.config` option in your `web-test-runner.config.mjs`:

```js
export default {
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '2000',
    },
  },
};
```

The server sends this configuration to the browser as JSON, so functions such as `rootHooks.beforeEach` are dropped. Define them in a browser setup module instead.

### Shared hooks and browser setup

To share hooks across JavaScript test files, use `testRunnerHtml` to load a setup module before importing the test framework. In `web-test-runner.config.mjs`:

```js
export default {
  nodeResolve: true,
  testRunnerHtml: testFramework =>
    `<!DOCTYPE html>
    <html>
      <body>
        <script type="module">
          await import('/test/setup-tests.js');
          await import('${testFramework}');
        </script>
      </body>
    </html>`,
};
```

Then create `test/setup-tests.js`:

```js
import sinon from 'sinon';

const config = window.__WTR_CONFIG__.testFrameworkConfig || {};

window.__WTR_CONFIG__.testFrameworkConfig = {
  ...config,
  rootHooks: {
    afterEach() {
      sinon.restore();
    },
  },
};
```

Root hooks run in every test file, because each file runs in its own page.

The sequential `await import()` calls let async setup and plugin registration finish before Mocha starts.

Do not use Mocha's `require` option, because the browser build does not support it and the test run does not finish.
