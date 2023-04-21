# Test Runner >> Responsive Sites ||40

With the world going mobile first, it is more important than ever to test your code against different viewport.

## Testing for mobile

Let's assume we have some code that should only execute on mobile.
It would be nice to have some sort of functionality to check for it.

How about a function `isMobile()` and it returns true/false.

👉 `src/isMobile.js`

```js
export function isMobile() {
  return !!window.matchMedia('(max-width: 1024px)').matches;
}
```

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

It feels like something is missing in this test... 🤔
Expecting something to be true in once case and false in another without any other function call feels wrong.
Right we are missing a way to change the actual size of the window.

For that we need to install the library:

```
npm i --save-dev @web/test-runner-commands
```

With that we get a `setViewport` method which we can put to good use.

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

## Testing media queries

For demonstration purposes we will write this example using an HTML test. Tests written as HTML are loaded by the test runner directly, a great way to set up some static HTML and CSS for our test.

Create a test file called `my-card.test.html` and set up the basic structure:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      .card {
        background: rgb(0, 255, 0);
      }

      @media screen and (min-width: 1024px) {
        .card {
          background: rgb(255, 0, 0);
        }
      }
    </style>
  </head>
  <body>
    <div class="card"></div>
  </body>
</html>
```

Next, we can write our tests to change the viewport and check if our media queries are working correctly:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      .card {
        background: rgb(0, 255, 0);
      }

      @media screen and (min-width: 1024px) {
        .card {
          background: rgb(255, 0, 0);
        }
      }
    </style>
  </head>
  <body>
    <div class="card"></div>

    <script type="module">
      import { runTests } from '@web/test-runner-mocha';
      import { expect } from '@esm-bundle/chai';
      import { setViewport } from '@web/test-runner-commands';

      runTests(() => {
        it('mobile has a green background', async () => {
          await setViewport({ width: 360, height: 640 });
          const el = document.querySelector('.card');
          const color = getComputedStyle(el).backgroundColor;
          expect(color).to.equal('rgb(0, 255, 0)');
        });

        it('desktop has a red background', async () => {
          await setViewport({ width: 1200, height: 1000 });
          const el = document.querySelector('.card');
          const color = getComputedStyle(el).backgroundColor;
          expect(color).to.equal('rgb(255, 0, 0)');
        });
      });
    </script>
  </body>
</html>
```

To run HTML tests, we need to include it in the files we pass on to the test runner in our `package.json` scripts:

```json
{
  "scripts": {
    "test": "web-test-runner \"test/**/*.test.{html,js}\" --node-resolve",
    "test:watch": "web-test-runner \"test/**/*.test.{html,js}\" --node-resolve --watch"
  }
}
```

## Nested suites

Now what happens if we have many tests that all require a certain viewport?
Always writing `await setViewport({ width: 1200, height: 1000 });` seems kinda repetitive.

For these cases mocha offers nested describes and `beforeEach`.
If there is a function `beforeEach` will be called before each of the tests in its `describe`.

In this case it would be called three times and each test can be sure to be executed with the correct viewport no matter what other test do while they are running.

```js
describe('desktop', () => {
  beforeEach(async () => {
    await setViewport({ width: 1200, height: 1000 });
  });

  it('has a red background', async () => {
    /* ... */
  });
  it('has a different font size', async () => {
    /* ... */
  });
  it('handles click events', async () => {
    /* ... */
  });
});
```

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/test-runner).
See the [documentation of @web/test-runner](../../docs/test-runner/overview.md).
