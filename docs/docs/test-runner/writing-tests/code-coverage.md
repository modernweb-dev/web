# Test Runner >> Writing Tests >> Code Coverage ||40

You can run tests with code coverage using the `--coverage` flag:

```
wtr test/**/*.test.js --coverage
```

In the config you can define code coverage thresholds, the test run fails if you drop below this level. You can also configure where and if the detailed test report is written to disk.

**Example config:**

```js
// web-test-runner.config.mjs

export default {
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

## Ignoring uncovered lines

Web Test Runner uses [`v8-to-istanbul`](https://github.com/istanbuljs/v8-to-istanbul) to covert V8 based code coverage to a form that can be reported by Istanbul. `v8-to-istanbul` allows for ignoring uncovered lines when calculating code coverage through the use of the following custom comment:

```js
/* c8 ignore next [line count] */
```

This is somewhat different than other tools where you might have specifically targeted `if` / `else` branches of logic with an ignore statement. Particularly, V8 does not create phantom `else` statements when calculating coverage, so it is likely that you will be able to use less of these statements than in the past.

In this way, you can skip the rest of a line:

```js
const text = (falsyOrStringVariableWithTrimmableWhiteSpace || /* c8 ignore next */ '').trim();
```

You can skip the entire next line:

```js
/* c8 ignore next */
if (!requiredVariable) return;
```

Or, you could skip multiple ensuing lines:

```js
if (normalCase) {
  // do normal things
  /* c8 ignore next 3 */
} else if (specialCase) {
  // do special things
}
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

## Coverage reporting

By default coverage reporting uses the lcov reporter. Should you want to use additional reporters, for example, cobertura, then the `reporter` config element should be modified.

**Example config:**

```js
// web-test-runner.config.mjs

export default {
  coverageConfig: {
    report: true,
    reportDir: 'test-coverage',
    reporters: ['cobertura', 'lcov']
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
```
