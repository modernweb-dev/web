# Test Runner Helpers

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
    await page.setViewport({ height: 640, width: 360 });
    console.log(window.innerHeight); // 640
    console.log(window.innerWidth); // 360
    // test implementation
  });

  it('works on 400x800', async () => {
    await setViewport({ width: 400, height: 800 });
    console.log(window.innerHeight); // 400
    console.log(window.innerWidth); // 800
    // test implementation
  });
});
```
