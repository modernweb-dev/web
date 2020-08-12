---
title: Enable your needs with custom plugins
eleventyNavigation:
  key: Writing Plugins
  parent: Test Runner
  order: 70
---

Not every use case will be covered by existing plugins 😱 &nbsp;
Therefore if you encounter a situation that requires some custom adjustments you can create a plugin yourself.

## Testing a tooltip

We would like to create a tooltip that is responsive.
Doing something like that from scratch might not be a good idea as there are many edge cases in regards to positioning.

We decided to use a popular package called [popper.js](https://popper.js.org/).

To get started we install it from npm

```bash
npm i @popperjs/core
```

Then we create a test file in accordance with popper documentation

👉 `test/tooltip.test.js`

```js
import { expect, fixture, html } from '@open-wc/testing';
import { createPopper } from '@popperjs/core';

it('can use popper', async () => {
  const wrapper = await fixture(html`
    <div>
      <button id="button" aria-describedby="tooltip">I'm a button</button>
      <div id="tooltip" role="tooltip">I'm a tooltip</div>
    </div>
  `);

  const button = wrapper.querySelector('#button');
  const tooltip = wrapper.querySelector('#tooltip');

  createPopper(button, tooltip, {
    placement: 'right',
  });
});
```

When we execute it we hover get an error 🤔

```bash
$ npm run test

> web-test-runner "test/**/*.test.js" --node-resolve

test/tooltip.test.js:

 ❌ can use popper
      at: node_modules/@popperjs/core/lib/index.js:81:9
      ReferenceError: process is not defined
        at Object.setOptions (node_modules/@popperjs/core/lib/index.js:81:9)
        at createPopper (node_modules/@popperjs/core/lib/index.js:215:14)
        at n.<anonymous> (test/tooltip.test.js:25:3)
```

If you are often using es modules directly in the browser then `ReferenceError: process is not defined` might sound familiar.
Some packages use the global `process.env` variable to check for environment variable.
This variable is available in node, but not in the browser.

We can, however "fake it" but writing a custom plugin.

## Configuration file

Plugins can be added via the configuration file `web-test-runner.config.mjs`.
In there you can define all the options you know from the CLI within a JS file.
For example, set the test files and enable the `nodeResolve` option.

👉 `web-test-runner.config.mjs`

```js
export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
};
```

Doing that means that your `package.json` script can become shorter

```json
"scripts": {
  "test": "web-test-runner",
  "test:watch": "web-test-runner --watch"
},
```

## Transform context

Plugins offer various hook into how code gets found, handled, and served.
For our case the `transform` hook is useful.

To understand what is going on we add a `hello world` plugin via an object to the plugins array.

Each plugin gets passed on the koa context which has some useful details

- `path`: server file path to the currently processing file
- `body`: string of the currently processing file
- `is('<Content-Type>')`: to check the Content-Type of the file that is currently being processed
- `headers`: object containing the request headers including for example `host`, `referer`, ...
- see [koas docs](https://koajs.com/#context) for more info about the api of context

In our case, the `path` is probably the most interesting. Let's log it.

```js
export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  plugins: [
    {
      name: 'provide-process',
      transform(context) {
        console.log('hello world');
        console.log(context.path);
      },
    },
  ],
};
```

If we run our tests now we get a long list of `hello world` and the path to the file.

```bash
hello world
/
hello world
/node_modules/@popperjs/core/lib/utils/detectOverflow.js
hello world
/node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
hello world
/node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
hello world
/node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
hello world
/node_modules/@open-wc/testing-helpers/src/fixture-no-side-effect.js
hello world
/node_modules/@popperjs/core/lib/utils/getOppositePlacement.js
```

Most interesting is actually the `/` root here and if we console log the body

```js
if (context.path === '/') {
  console.log({
    path: context.path,
    body: context.body,
  });
}
```

we get

```
{
  path: '/',
  body: '<!DOCTYPE html>\n' +
    '<html>\n' +
    '  <head></head>\n' +
    '  <body>\n' +
    '    <script type="module">\n' +
    "      import('/__web-test-runner__/test-framework/[...]/node_modules/@web/test-runner-mocha/dist/autorun.js').catch((error) => {\n" +
    '        console.error(error);\n' +
    "        console.error('\u001b[31mThe test framework could not be loaded. Are your dependencies installed correctly? Is there a server plugin or middleware that interferes?\u001b[39m');\n" +
    '      });\n' +
    '    </script>\n' +
    '  </body>\n' +
    '</html>'
}
```

## Writing a plugin for process is not defined

Now we know that web test runner serves the test HTML page via `/` and we can use that to do additional modifications.

Our original problem is still `ReferenceError: process is not defined` which we can solve by defining it for the browser.

But how can we do this? Adding an extra script tag could be enough?

```html
<script>
  window.process = { env: { NODE_ENV: 'development' } };
</script>
```

In order to insert this snippet, we can us a transform plugin and insert it right into the header.

```js
export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  plugins: [
    {
      name: 'provide-process',
      transform(context) {
        if (context.path === '/') {
          const transformedBody = context.body.replace(
            '</head>',
            '<script>window.process = { env: { NODE_ENV: "development" } }</script></head>',
          );
          return transformedBody;
        }
      },
    },
  ],
};
```

With that, we are finally green 💪

```
Chrome: |██████████████████████████████| 1/1 test files | 1 passed, 0 failed

Finished running tests in 1.3s, all tests passed! 🎉
```

When using 3rd party npm dependencies the code might not work out of the box in a browser.
With this plugin we however made it possible to run popper directly in the browser and therefore also within our test runner.

## Mocking API responses

Next up we have a helper function that can get meta information for users.
This function requires an API as it will fetch a REST JSON endpoint while in production.

The test is checking if the data you get is correct.

👉 `test/getUser.test.js`

```js
it('can get meta data via a userId', async () => {
  const user3 = await getUser(3);
  expect(user3.name).to.equal('Lea');

  const user10 = await getUser(10);
  expect(user10.name).to.equal('Peter');
});
```

Now when we implement this function, we use fetch to make a request to the API endpoint.

👉 `src/getUser.js`

```js
export async function getUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();
  return data;
}
```

When we start the test we do get an unexpected error.

```
test/getUser.test.js:

 🚧 404 network requests:
    - api/users/3

 ❌ can get meta data via a userId
      SyntaxError: Unexpected token N in JSON at position 0
```

The url `api/users/3` returned `404` which means the file could not be found.
Also, our JSON parsing failed as the `404` page has `Not Found` as its body.
And `Not Found` is not valid JSON 😅

To create virtual files we can use the `serve` plugin hook.
In there again you have access to the Koa context.

> By default the file extension is used to infer the mime type to respond with.

As we are using no file extension at all we need to return an object with a `type` property to set it explicitly.

👉 `web-test-runner.config.mjs`

```js
export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  plugins: [
    {
      name: 'mock-api',
      serve(context) {
        if (context.path === '/api/users/3') {
          return { body: '{ "name": "Lea" }', type: 'json' };
        }
        if (context.path === '/api/users/10') {
          return { body: '{ "name": "Peter" }', type: 'json' };
        }
      },
    },
  ],
};
```

_Note: Plugins are an abstraction over koa middlewares - if you need more control you can [create a middleware](../../docs/dev-server/middleware/index.md) directly if needed_

## Learn more

We can now write our own plugins to transform existing files or server virtual files.
Plugins offer even more functionalities so be sure to check out the docs.

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/learn/test-runner-writing-plugins).
See the [documentation of @web/test-runner](../../docs/test-runner/overview.md).
