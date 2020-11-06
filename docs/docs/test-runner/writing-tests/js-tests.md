# Test Runner >> Writing Tests >> JS Tests ||10

Javascript files are loaded by the test framework that is configured. The default test framework is mocha, which loads your test as a standard browser es module. You can use module imports to import your code and any modules you want to use for testing.

For example:

```js
import { expect } from '@esm-bundle/chai';
import { myFunction } from '../src/myFunction.js';

describe('myFunction', () => {
  it('adds two numbers together', () => {
    expect(myFunction(1, 2)).to.equal(3);
  });
});
```

See the [Test frameworks](../test-frameworks/index.md) and [es modules](../../../guides/going-buildless/es-modules.md) sections for more information.
