# Test Runner >> Writing Tests >> Mocking ||50

## Mocking functions

For stubbing and mocking functions, we recommend [sinon](https://www.npmjs.com/package/sinon).

Sinon ships an es module, you can import it in your tests like this:

```js
import { stub, spy, useFakeTimers } from 'sinon';
```

## Mocking es modules

Es modules are immutable, it's not possible to mock or stub imports:

```js
import { stub } from 'sinon';
import * as myModule from './my-module.js';

// not possible
stub(myModule, 'myImport');
```

We can use [Import Maps](https://github.com/WICG/import-maps) in our tests to resolve module imports to a mocked version.

### Using Import Maps to tests

To use Import Maps in your tests, you can add [@web/dev-server-import-maps](../../dev-server/plugins/import-maps.md) to your `web-test-runner.config.mjs`:

```js
import { importMapsPlugin } from '@web/dev-server-import-maps';

export default {
  plugins: [
    importMapsPlugin({
      inject: {
        importMap: {
          imports: {
            // mock a dependency
            'package-a': '/mocks/package-a.js',
            // mock a module in your own code
            '/src/my-module.js': '/mocks/my-module.js',
          },
        },
      },
    }),
  ],
};
```

This will inject the import map to every HTML file in your tests. Go to the [Import Maps Plugin](../../dev-server/plugins/import-maps.md) page to learn more about how import maps work and how to configure more options.

### Import Map per test

Import Maps are defined in HTML. We need to write a [HTML test](./html-tests.md) to use a specific Import Map per test.

This is an example using Mocha. We want to test if a function works correctly without actually causing side effects, like posting data to a server. We mock the module that causes side effects in our test.

Source code:

`/postData.js:`

```js
export function postData(endpoint, data) {
  return fetch(`/api/${endpoint}`, { method: 'POST', body: JSON.stringify(data) });
}
```

`/postMessage.js:`

```js
import { postData } from './postData.js';

export function sendMessage(message) {
  return postData('message', { message });
}
```

Mocked module:

`/mocks/postData.js:`

```js
import { stub } from 'sinon';

export const postData = stub();
```

Test file:

```html
<html>
  <head>
    <!-- the import map to use in our test -->
    <script type="importmap">
      {
        "imports": {
          "./postData.js": "./mocks/postData.js"
        }
      }
    </script>
  </head>

  <body>
    <script type="module">
      import { runTests } from '@web/test-runner-mocha';
      import { expect } from '@esm-bundle/chai';
      // import inside will resolve to ./mocks/postData.js
      import { sendMessage } from '../src/sendMessage.js';
      // resolves to ./mocks/postData.js
      import { postData } from './postData.js';

      runTests(() => {
        beforeEach(() => {
          postData.reset();
        });

        describe('postMessage()', () => {
          it('calls postData', () => {
            await sendMessage('foo');
            expect(postData.callCount).to.equal(1);
            expect(postData.getCall(0).args).to.eql(['message', { message: 'foo' }]);
          });
        });
      });
    </script>
  </body>
</html>
```
