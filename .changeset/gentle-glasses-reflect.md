---
'@web/test-runner-mocha': minor
'@web/test-runner': minor
---

Disabled the in-browser reporter during regular test runs, improving performance.

Defaulted to the spec reporter instead of the HTML reporter in the browser when debugging. This avoids manipulating the testing environment by default.

You can opt back into the old behavior by setting the mocha config:

```js
export default {
  testFramework: {
    config: { reporter: 'html' },
  },
};
```
