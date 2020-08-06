---
title: Testing responsive sites
eleventyNavigation:
  key: Responsive
  parent: Test Runner
  order: 40
---

With the world going mobile first there needs to be a way of testing your mobile views.
Working with a real browser you can directly change the viewport.

## Testing for mobile

Let's assume we have some code that should only execute on mobile.
It would be nice to have some sort of functionality to check for it.

How about a function `isMobile()` and it returns true/false.

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

```bash
npm i -D @web/test-runner-helpers
```

With that we get a `setViewport` method which we can put to good use.

```js
import { expect } from '@open-wc/testing';
import { setViewport } from '@web/test-runner-helpers';
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

Imagine we have a card that should have a `green` background on mobile and a `red` background on desktop.

The css is fairly straight forward:

```css
.card {
  background: rgb(0, 255, 0);
}

@media screen and (min-width: 1024px) {
  .card {
    background: rgb(255, 0, 0);
  }
}
```

So how can we test that?

First we set the viewport size.
Then we create a html fixture which means the nodes will be created and added to the dom (and automatically cleaned up after the test).

Finally we check if our css media query from above actually is working.

```js
it('mobile has a green background', async () => {
  await setViewport({ width: 360, height: 640 });
  const el = await fixture(html`<div class="card"></div>`);
  expect(getComputedStyle(el).backgroundColor).to.equal('rgb(0, 255, 0)');
});

it('desktop has a red background', async () => {
  await setViewport({ width: 1200, height: 1000 });
  const el = await fixture(html`<div class="card"></div>`);
  expect(getComputedStyle(el).backgroundColor).to.equal('rgb(255, 0, 0)');
});
```

_In this tests we combine js and css so we will need to put the css into the test site_

```js
before(() => {
  // add css files to page for the test
  const link = document.createElement('link');
  link.href = new URL('../src/styles.css', import.meta.url);
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});
```

## Nested suites

Now what happens if we have many tests that all require a certain viewport?
Always writing `await setViewport({ width: 1200, height: 1000 });` seems kinda repetitive.

For these cases mocha offers nested describes and `beforeEach`.
This special function `beforeEach` will be called before each of the tests in its `describe`.

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

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/learn/test-runner-responsive).

See the [documentation of @web/test-runner](../../docs/test-runner/overview.md).
