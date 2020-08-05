---
title: Test Runner Helpers
eleventyNavigation:
  key: Helpers
  parent: Test Runner
  order: -80
---

Helpers for running tests with [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner).

## Usage

Install the library:

```bash
npm i -D @web/test-runner-helpers
```

### Viewport

You can set the browser viewport using the `setViewport` function. This affects all tests in the current test file.

```js
import { setViewport } from '@web/test-runner-helpers';

describe('my component', () => {
  it('works on 360x640', async () => {
    await setViewport({ width: 360, height: 640 });
    console.log(window.innerWidth); // 360
    console.log(window.innerHeight); // 640
  });

  it('works on 400x800', async () => {
    await setViewport({ width: 400, height: 800 });
    console.log(window.innerWidth); // 400
    console.log(window.innerHeight); // 800
  });
});
```
