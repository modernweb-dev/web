---
title: Test Runner Mocha
eleventyNavigation:
  key: Mocha
  parent: Test Runner
  order: -90
---

Test framework implementation of [Mocha](https://mochajs.org/) for Web Test Runner

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.

## Writing tests

### Writing JS tests

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

### Writing HTML tests

If you're writing tests as HTML, you can import this library to run tests with mocha:

```html
<html>
  <body>
    <script type="module">
      // after importing "@web/test-runner-mocha", describe and it will be available globally
      import { runTests } from '@web/test-runner-mocha';

      describe('my test', () => {
        it('foo is bar', () => {
          if ('foo' !== 'bar') {
            throw new Error('foo does not equal bar');
          }
        });
      });

      // you need to call runTests() when you've loaded all your tests
      runTests();
    </script>
  </body>
</html>
```

Configuring mocha to use TDD is [not yet supported](https://github.com/modernweb-dev/web/issues/59).

### Browser compatible code

Web Test Runner is based on bundle-free development, and runs your tests in the browser without any modification. This means you need to make sure your tests, code and test libraries can work in the browser as is. For example they should be standard es modules.

The test runner server can be configured to do some code transformations on the fly, although this may impact performance. [Check out the docs](./server.md) to learn more about that.

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
