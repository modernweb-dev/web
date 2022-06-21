---
title: 'Introducing: Web Test Runner'
published: false
canonical_url: https://modern-web.dev/blog/introducing-web-test-runner/
description: Reexperience the joy of working with the standards based web. Starting off with a test runner which uses multiple browsers in parallel.
date: 2020-08-25
tags: [javascript, web-test-runner]
cover_image: /blog/introducing-web-test-runner/introducing-web-test-runner-blog-header.jpg
socialMediaImage: /blog/introducing-web-test-runner/introducing-web-test-runner-blog-social-media-image.jpg
---

We are very excited to announce today the official 1.x release of [web test runner](../../docs/test-runner/overview.md), a project we have been working on for the past months.

There are already a lot of testing solutions out there today. Unfortunately, all of them either run tests in Node.js and mock browser APIs using something like JSDom or don't support native es modules out of the box. We think that making browser code compatible for testing in node is unnecessarily complex. Running tests in real browsers gives greater confidence in (cross-browser) compatibility and makes writing and debugging tests more approachable.

By building on top of our web dev server, and modern browser launchers like Puppeteer and Playwright, we created a new test runner which fills this gap in the ecosystem. We think it is already feature-complete enough to be picked up by any web project.

Some highlights:

👉&nbsp;&nbsp; Headless browsers with [Puppeteer](../../docs/test-runner/browsers/puppeteer.md), [Playwright](../../docs/test-runner/browsers/playwright.md), or [Selenium](../../docs/test-runner/browsers/selenium.md). <br>
🚧&nbsp;&nbsp; Reports logs, 404s, and errors from the browser. <br>
🔍&nbsp;&nbsp; Debug opens a real browser window with devtools.<br>
🔧&nbsp;&nbsp; Exposes browser properties like viewport size and dark mode.<br>
⏱&nbsp;&nbsp;Runs tests in parallel and isolation.<br>
👀&nbsp;&nbsp; Interactive watch mode.<br>
🏃&nbsp;&nbsp; Fast development by rerunning only changed tests.<br>
🚀&nbsp;&nbsp; Powered by [esbuild](../../docs/dev-server/plugins/esbuild.md) and [rollup plugins](../../docs/dev-server/plugins/rollup.md)

## Getting started with Web Test Runner

This is the minimal instruction on how to start using the web test runner.

1. Install the necessary packages

   ```
   npm i --save-dev @web/test-runner @esm-bundle/chai
   ```

2. Add a script to your `package.json`

   ```json
   {
     "scripts": {
       "test": "web-test-runner \"test/**/*.test.js\" --node-resolve",
       "test:watch": "web-test-runner \"test/**/*.test.js\" --node-resolve --watch"
     }
   }
   ```

3. Create a test file `test/sum.test.js`.

   ```js
   import { expect } from '@esm-bundle/chai';
   import { sum } from '../src/sum.js';

   it('sums up 2 numbers', () => {
     expect(sum(1, 1)).to.equal(2);
     expect(sum(3, 12)).to.equal(15);
   });
   ```

4. Create the src file `src/sum.js`

   ```js
   export function sum(a, b) {
     return a + b;
   }
   ```

5. Run it

   ```
   $ npm run test
   $ web-test-runner test/**/*.test.js --coverage --node-resolve

   Chrome: |██████████████████████████████| 1/1 test files | 1 passed, 0 failed

   Code coverage: 100 %
   View full coverage report at coverage/lcov-report/index.html

   Finished running tests in 0.9s, all tests passed! 🎉
   ```

You can find more detailed instructions in the [Getting Started Guide](../../guides/test-runner/getting-started.md).

## Watch and debug

Once you have the basic test running you can enjoy some of the more advanced features, such as `watch` mode.

With `watch` mode, the same tests will be run but you get some additional features that help with development and debugging:

- Tests are rerun on file change (source or test)
- You can focus on a specific test file
- You can open a test file in the browser

Most of you will probably be familiar with automatic rerunning of tests, but what do we mean with focusing on a specific test file?

Focus mode is actually one of the key features when working with many test files. While developing your code, you'll often want to _focus_ on one test file only. With web test runner, you can do this straight from your terminal, to improve your workflow.

Start the test runner in watch mode and you will see a menu at the bottom:

```
Finished running tests, watching for file changes...

Press F to focus on a test file.
Press D to debug in the browser.
Press Q to quit watch mode.
Press Enter to re-run all tests.
```

Now if you use `F` a menu will present itself with all the files you can focus on

```
[1] test/calc.test.js
[2] test/sum.test.js
[3] test/multiply.test.js

Number of the file to focus: 2
```

Once a test file is focused you can also open it directly in the browser.

You can find more detailed instructions in the [Watch and Debug Guide](../../guides/test-runner/watch-and-debug/index.md).

## Test in multiple browsers using playwright

[Playwright](https://github.com/microsoft/playwright) is a great tool by Microsoft that allows us to run tests in all evergreen browsers.

If you want to make use of this, you can do so by following these instructions:

```
npm i --save-dev @web/test-runner-playwright
```

This will locally install the required versions of Chromium, Firefox, and WebKit. Once installation is done, we can specify which browsers we want to actually make use of in our `package.json` script:

```json
"test": "web-test-runner \"test/**/*.test.js\" --node-resolve --playwright --browsers chromium firefox webkit",
```

Now all we need to do is run our tests:

```
$ yarn test
$ web-test-runner "test/**/*.test.js" --node-resolve --playwright --browsers chromium firefox webkit

Chromium: |██████████████████████████████| 2/2 test files | 3 passed, 0 failed
Firefox:  |██████████████████████████████| 2/2 test files | 3 passed, 0 failed
Webkit:   |██████████████████████████████| 2/2 test files | 3 passed, 0 failed

Finished running tests in 3.4s, all tests passed! 🎉
```

As you can see, we've executed 2 test files in 3 different real browsers.
If all your tests are green you can't get any more confident about your code. So let's ship it!

See more instructions in the [Browsers Guide](../../guides/test-runner/browsers.md).

## Testing responsive views

With the world going mobile-first there needs to be a way of testing your mobile views. Working with a real browser means you can directly change the viewport.

Let's assume we have some code that should only execute on mobile.
It would be nice to have some sort of functionality to check for it.

You might implement a function called `isMobile()` that returns true/false.

```js
describe('isMobile', () => {
  it('returns true if width < 1024px', async () => {
    expect(isMobile()).to.be.true;
  });

  it('returns false if width > 1024px', async () => {
    expect(isMobile()).to.be.false;
  });
});
```

Doesn't it feel like something is missing in this test, though?
We need to have a way to run these two tests on different viewport sizes to verify if they work correctly.

For that we can to install a library:

```
npm i --save-dev @web/test-runner-commands
```

With that, we get a `setViewport` method which we can use.

```js
import { expect } from '@esm-bundle/chai';
import { setViewport } from '@web/test-runner-commands';
import { isMobile } from '../src/isMobile';

describe('isMobile', () => {
  it('returns true if width < 1024px', async () => {
    await setViewport({ width: 360, height: 640 });
    expect(isMobile()).to.be.true;
  });

  it('returns false if width > 1024px', async () => {
    await setViewport({ width: 1200, height: 640 });
    expect(isMobile()).to.be.false;
  });
});
```

If you want to know more, like for example how to test CSS media queries see the [Responsive Guide](../../guides/test-runner/responsive.md). See the [commands documentation](../../docs/test-runner/commands.md) to learn more about additional features like emulating media, setting the user agent or writing your own commands.

## Taking code coverage into account

Once you have a decent set of tests you may want to look into what could still be improved.
Code coverage can help to find which code segments have not yet been tested.

Any web-test-runner launcher that works with chromium can provide code coverage.

To enable it you add the `--coverage` flag.

`package.json`:

```json
{
  "scripts": {
    "test": "web-test-runner \"test/**/*.test.js\" --node-resolve --coverage"
  }
}
```

See more instructions in the [Code Coverage Guide](../../guides/test-runner/code-coverage/index.md).

## Using TypeScript

> Browsers don't support Typescript syntax. Your code will need to be transformed before it is served to the browser, adding extra complexity and compilation time. While typescript can be a powerful addition to your project, we generally don't recommend it for beginners.

First, we need to install the required dependencies:

```
npm i --save-dev @web/test-runner @esm-bundle/chai @types/mocha typescript
```

Add the `src/sum.ts` file:

```ts
export function sum(...numbers: number[]) {
  let sum = 0;
  for (const number of numbers) {
    sum += number;
  }
  return sum;
}
```

Add the `test/sum.test.ts` file:

```ts
import { expect } from '@esm-bundle/chai';
import { sum } from '../src/sum.js';

it('sums up 2 numbers', () => {
  expect(sum(1, 1)).to.equal(2);
  expect(sum(3, 12)).to.equal(15);
});

it('sums up 3 numbers', () => {
  expect(sum(1, 1, 1)).to.equal(3);
  expect(sum(3, 12, 5)).to.equal(20);
});
```

> Notice that we're using the `.js` extension in our import. With native es modules, file extensions are required so we recommend using them even in Typescript files.

The easiest way to use Typescript with the test runner is to use `tsc`, the official typescript compiler.

To do this, we first need to add some scripts to our `package.json`:

```json
{
  "scripts": {
    "test": "web-test-runner \"test/**/*.test.js\" --node-resolve",
    "build": "tsc"
  }
}
```

To execute you run

```
npm run build
npm run test
```

See more instructions in the [Using TypeScript Guide](../../guides/test-runner/using-typescript.md).

## Enable your needs with custom plugins

Unfortunately, not every use case will be covered by existing plugins. Therefore if you encounter a situation that requires some custom adjustments you can create a plugin yourself.

If you are often using ES modules directly in the browser then `ReferenceError: process is not defined` might sound familiar.
Some packages use the global `process.env` variable to check for environment variable. This variable is available in node, but not in the browser.

We can, however fake it by writing a custom plugin.

Plugins can be added via the configuration file `web-test-runner.config.mjs` and offer various hooks into how code gets found, handled, and served.
For our use case the `transform` hook is useful.

`web-test-runner.config.mjs`

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

This is only one example and plugins can do way more and if you want to go even more low level you can also write your own koa middleware.

See more instructions in the [Writing Plugin Guide](../../guides/test-runner/writing-plugins.md).

## Thanks for reading

We are incredibly proud of our first Modern Web Tool, and we hope you find it useful as well. If you find an issue or if you are stuck [please let us know](https://github.com/modernweb-dev/web/issues/new).

There is much, much more to come so follow us on [Twitter](https://twitter.com/modern_web_dev) and if you like what you see please consider sponsoring the project on [Open Collective](https://opencollective.com/modern-web).

---

<span>Photo by <a href="https://unsplash.com/@lemonvlad">Vladislav Klapin</a> on <a href="https://unsplash.com/s/photos/hello">Unsplash</a></span>
