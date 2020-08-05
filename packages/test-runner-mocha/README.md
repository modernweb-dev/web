---
title: Test Runner Mocha
eleventyNavigation:
  key: Mocha
  parent: Test Runner
  order: 100
---

# Test Runner Mocha

Test framework implementation of [Mocha](https://mochajs.org/) for Web Test Runner

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.

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

If you're writing tests as HTML, you can import this library to run tests with mocha.

### Inline tests

You can write tests inline in the HTML page

<details>
<summary>View example</summary>

```html
<html>
  <body>
    <script type="module">
      import { mocha, sessionFinished, sessionFailed } from '@web/test-runner-mocha';

      try {
        // setup mocha
        mocha.setup({ ui: 'bdd' });

        // write your actual tests
        describe('HTML tests', () => {
          it('works', () => {
            expect('foo').to.equal('foo');
          });
        });

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

</details>

### Loading test files

You can also use dynamic imports to load tests written in JS from the HTML page.

<details>
<summary>View example</summary>

```html
<html>
  <body>
    <script type="module">
      import { mocha, sessionFinished } from '@web/test-runner-mocha';

      async function run() {
        try {
          // setup mocha
          mocha.setup({ ui: 'bdd' });

          // import your tests
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
      }

      run();
    </script>
  </body>
</html>
```

</details>

### Loading polyfills or libraries

From the HTML page you can load polyfills or libraries to be set up before your tests are run. This is great for testing your code in different environments.

<details>
<summary>Load polyfills or libraries</summary>

```html
<html>
  <body>
    <script src="./some-polyfill.js"></script>

    <script type="module">
      import { mocha, sessionFinished } from '@web/test-runner-mocha';

      // see examples above
    </script>
  </body>
</html>
```

</details>

### Configuring browser environment

You can use elements in the `<head>` to configure different browser environment, such as base path or CSP rules.

<details>
<summary>Load polyfills or libraries</summary>

```html
<html>
  <head>
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; img-src https://*; child-src 'none';"
    />
  </head>
  <body>
    <script type="module">
      import { mocha, sessionFinished } from '@web/test-runner-mocha';

      // see examples above
    </script>
  </body>
</html>
```

</details>

## Configuring mocha options

You can configure mocha options using the `testFramework.config` option:

```js
module.exports = {
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '2000',
    },
  },
};
```

The config entry accepts any of the official [mocha browser options](https://mochajs.org/#browser-configuration).

### Libraries

[@open-wc/testing](https://open-wc.org/testing/testing.html) is a general purpose library, including assertions via chai, HTML test fixtures, a11y tests and test helpers.

It is an opinionated implementation which brings together multiple libraries. You could also use the individual libraries together:

- [@bundled-es-modules/chai](https://www.npmjs.com/package/@bundled-es-modules/chai)
- [@open-wc/testing-helpers](https://www.npmjs.com/package/@open-wc/testing-helpers)
- [@open-wc/chai-dom-equals](https://www.npmjs.com/package/@open-wc/chai-dom-equals)
- [chai-a11y-axe](https://www.npmjs.com/package/chai-a11y-axe)

For stubbing and mocking, we recommend [sinon](https://www.npmjs.com/package/sinon) which ships an es module variant out of the box:

```js
import { stub, useFakeTimers } from 'sinon';
```
