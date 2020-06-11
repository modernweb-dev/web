# Test Runner Mocha

Test framework implementation of [Mocha](https://mochajs.org/) for Web Test Runner

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.

## Writing tests

Mocha relies on global variables, in any test file `describe` and `it` are available globally:

```js
describe('my test', () => {
  it('foo is bar', () => {
    if ('foo' !== 'bar') {
      throw new Error('foo does not equal bar');
    }
  });
});
```

Configuring mocha to use TDD is [not yet supported](https://github.com/modernweb-dev/web/issues/59).

### Writing assertions

You can use any assertion library as long as it works in the browser. For example this es module version of chai:

```js
import { expect } from '@bundled-es-modules/chai';

test('foo is bar', () => {
  expect(foo).to.equal('bar');
});
```

### Creating HTML test fixture

To scaffold an HTML test fixture you can use the `@open-wc/testing-helpers` library.

```js
import { fixture, html } from '@open-wc/testing-helpers';
import { expect } from '@bundled-es-modules/chai';
import '../my-element.js';

describe('my-element', () => {
  it('should render properly', async () => {
    const element = await fixture(html` <my-element></my-element> `);
    expect(element.localName).to.equal('my-element');
  });
});
```
