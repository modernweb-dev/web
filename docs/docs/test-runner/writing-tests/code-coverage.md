---
title: Code Coverage
eleventyNavigation:
  key: Code Coverage
  parent: Writing tests
  order: 30
---

You can run tests with code coverage using the `--coverage` flag:

```
wtr test/**/*.test.js --coverage
```

In the config you can define code coverage thresholds, the test run fails if you drop below this level. You can also configure where and if the detailed test report is written to disk.

**Example config:**

```js
// web-test-runner.config.mjs

module.exports = {
  coverageConfig: {
    report: true,
    reportDir: 'test-coverage',
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
```

## Coverage browser support

The default coverage of the test runner uses the ability of Chromium to do native code coverage instrumentation. This gives us the best speed. When testing multiple browsers this should still be fine, you don't need to get code coverage from all browsers. One browser is usually enough.

If you need to collect coverage from all browsers, or if you're not testing for Chromium at all, you can use [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) to do the code instrumentation. You can use the rollup babel plugin to set this up. This approach is slower and works differently because the instrumentation is done in javascript.

If you choose to use the babel plugin, you can turn off native instrumentation by setting `nativeInstrumentation` to false. This avoids double instrumentation.

**Example config:**

```js
// web-test-runner.config.mjs

import { fromRollup } from '@web/dev-server-rollup';
import rollupBabel from '@rollup/plugin-babel';

const babel = fromRollup(rollupBabel);

export default {
  coverage: true,
  coverageConfig: {
    nativeInstrumentation: false,
  },
  plugins: [
    babel({
      // avoid running babel on code that doesn't need it
      include: ['src/**/*.js'],
      babelHelpers: 'bundled',
      plugins: ['babel-plugin-istanbul'],
    }),
  ],
};
```
