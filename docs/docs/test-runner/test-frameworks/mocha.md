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

The server JSON-serializes this configuration before sending it to the browser, so its values must be JSON-serializable. Functions, such as `rootHooks.beforeEach` and `rootHooks.afterEach`, cannot be passed directly in this configuration. Define them in a browser setup module instead.

### Shared hooks and browser setup

To share hooks across JavaScript test files, use `testRunnerHtml` to load a setup module before importing the test framework. In `web-test-runner.config.mjs`:

```js
export default {
  files: 'test/**/*.test.js',
  rootDir: '.',
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '2000',
    },
  },
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
const existingConfig = window.__WTR_CONFIG__.testFrameworkConfig || {};
let fixture;

window.__WTR_CONFIG__.testFrameworkConfig = {
  ...existingConfig,
  rootHooks: {
    ...existingConfig.rootHooks,
    beforeEach() {
      fixture = document.createElement('div');
      fixture.id = 'test-fixture';
      document.body.appendChild(fixture);
    },
    afterEach() {
      fixture.remove();
    },
  },
};
```

Each test can use `document.querySelector('#test-fixture')` as its container. The `beforeEach` hook creates a fresh fixture for each test, and `afterEach` removes it and its contents. These root hooks are registered separately in each test-file session; they do not run once globally across all files or workers.

The assignment preserves existing options such as `ui` and `timeout`, as well as unrelated root-hook keys. It also works when `testFramework.config` is absent. The example replaces any existing `beforeEach` and `afterEach` hooks rather than combining them.

The sequential `await import(...)` calls ensure that setup finishes before Mocha initializes, including any asynchronous work awaited by the setup module. Do not replace the framework import with a static import in the same module: static imports execute before the module body. Browser-compatible plugin initialization can also happen in the setup module before the framework import; any plugin imports must be resolvable by your configured server.

Mocha's Node-side `require` option does not load a Node setup module in this browser runner. Use the browser imports above instead. Setup module URLs must be served within `rootDir`: this example assumes you run from the project root, so `/test/setup-tests.js` resolves to `test/setup-tests.js` in your project. The setup file is outside the selected `test/**/*.test.js` glob, so it is not run as a test file itself.
