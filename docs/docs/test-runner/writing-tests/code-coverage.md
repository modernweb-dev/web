---
title: Code Coverage
eleventyNavigation:
  key: Code Coverage
  parent: Writing tests
  order: 30
---

You can run tests with code coverage using the `--coverage` flag:

```bash
wtr test/**/*.test.js --coverage
```

In the config you can define code coverage thresholds, the test run fails if you drop below this level. You can also configure where and if the detailed test report is written to disk.

<details>
<summary>View example</summary>

```js
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

</details>

The default code coverage only collects coverage on the Chromium browser, which provides this functionality natively. To enable collecting coverage on other browsers, you can use [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) to do the code instrumentation. This is slower and works differently because the instrumentation is done in javascript.

If you choose to use the babel plugin, you can off native instrumentation by setting `nativeInstrumentation` to false. This avoids double instrumentation.

<details>

<summary>View example</summary>

```js
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

</details>
