# Test Runner >> Writing Tests >> Code Coverage ||40

You can run tests with code coverage using the `--coverage` flag:

```
wtr test/**/*.test.js --coverage
```

Additionally, your config file has a `coverage` boolean to toggle coverage on and off.

## Basic configuration

Code coverage is measured using four metrics: statements, branches, functions, and lines.
The test runner measures these metrics across all files combined.

In `coverageConfig`, you need to define your desired code coverage thresholds for each metric.
The test run fails if you drop below this level for any metric.
The default setting is 0 for each metric.

**Example minimum to require code coverage:**

```js
// web-test-runner.config.mjs

export default {
  coverage: true,
  coverageConfig: {
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
```

## Including and excluding code

Use the `include` and `exclude` settings in `coverageConfig` to control which files' code coverage measurements count toward your total.
Each is an array of glob patterns. By default, all touched files are included unless they match an exclude pattern.

The default exclude patterns are `['**/node_modules/**/*', '**/web_modules/**/*']`. Additionally, files following your
test-file patterns are excluded.

**Example include and exclude:**

```js
// web-test-runner.config.mjs

export default {
  files: ['tests/**'], // these are excluded also
  coverage: true,
  coverageConfig: {
    include: ['ui/**', 'lib/**'],
    exclude: ['lib/**.cjs', 'ui/untestable-file.js'],
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
```

### Ignoring uncovered lines

Web Test Runner uses [`v8-to-istanbul`](https://github.com/istanbuljs/v8-to-istanbul) to convert V8-based code coverage to a form that can be reported by Istanbul.
`v8-to-istanbul` allows for ignoring uncovered lines when calculating code coverage through the use of the following custom comment:

```js
/* c8 ignore next [line count] */
```

This is somewhat different from other tools in which you might have specifically targeted `if` / `else` branches of logic with an ignore statement.
Particularly, V8 does not create phantom `else` statements when calculating coverage, so it is likely that you will be able to use fewer of these statements than in the past.

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

The default coverage of the test runner uses the ability of Chromium to do native code coverage instrumentation.
This gives us the best speed. When testing multiple browsers this should still be fine, you don't need to get code coverage from all browsers.
One browser is usually enough.

If you need to collect coverage from all browsers, or if you're not testing for Chromium at all, you can use [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) to do the code instrumentation.
You can use the rollup babel plugin to set this up. This approach is slower and works differently because the instrumentation is done in javascript.

If you choose to use the babel plugin, you can turn off native instrumentation by setting `nativeInstrumentation` to false. This avoids double instrumentation.

**Example with babel:**

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

By default, the test runner's coverage reporting uses the `lcov` reporter. Use the `reporters` configuration to select others.
You can choose from the reporters listed in [istanbul-reports/lib](https://github.com/istanbuljs/istanbuljs/tree/main/packages/istanbul-reports/lib).
Previews for some popular ones are at [Alternative Reporters](https://istanbul.js.org/docs/advanced/alternative-reporters/).

Use the `reportDir` setting to choose where reports are written.
The default setting is `coverage`.

**Example with cobertura and lcov:**

```js
// web-test-runner.config.mjs

export default {
  coverage: true,
  coverageConfig: {
    reportDir: 'test-coverage',
    reporters: ['cobertura', 'lcov'],
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
```

### Code coverage without reports

You can turn off reports but otherwise require code coverage using the `none` reporter.

**Example without reports:**

```js
// web-test-runner.config.mjs

export default {
  coverage: true,
  coverageConfig: {
    reporters: ['none'],
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
```

### Options for each reporter

You can provide additional options for many reporters, such as their output file name.
The available options for each are listed in [@types/istanbul-reports](https://www.npmjs.com/package/@types/istanbul-reports),
but there is little documentation for what each setting does.
Provide `reportOptions` items separately for each reporter.

In this example, the reports directory will contain both 'cobertura.xml' and an 'html-output' directory containing the HTML report.

**Example with cobertura and html-spa full options:**

```js
// web-test-runner.config.mjs

export default {
  coverage: true,
  coverageConfig: {
    reportDir: 'reports',
    reporters: ['html-spa', 'cobertura'],
    reportOptions: {
      cobertura: {
        file: 'cobertura.xml',
      },
      'html-spa': {
        verbose: true,
        skipEmpty: true,
        subdir: 'html-output',
        linkMapper: {
          getPath: node => myPathTransformFunction(node),
          relativePath: node => myRelativePathTransformFunction(node),
          assetPath: node => myAssetPathTransformFunction(node),
        },
        metricsToShow: ['lines', 'branches', 'functions', 'statements'],
      },
    },
  },
};
```

### Report color-coding

Some reporters show red/yellow/green color-coding, which is adjustable using the `watermarks` configuration.
Coverage below the lower mark displays in red, coverage between the marks displays in yellow,
and coverage above the upper mark displays in green. The default marks are `[50, 80]` for each metric.

Affected reporters:

- html
- html-spa
- lcov
- text
- text-summary

In this example, the displayed `lcov` HTML report will show yellow for files that almost reach each threshold,
red for files that are far below each threshold, and green for files that are above the threshold.

**Example color-coding that matches thresholds:**

```js
// web-test-runner.config.mjs

export default {
  coverage: true,
  coverageConfig: {
    reporters: ['lcov'],
    threshold: {
      statements: 90,
      branches: 50,
      functions: 80,
      lines: 90,
    },
    watermarks: {
      statements: [85, 90],
      branches: [45, 50],
      functions: [75, 80],
      lines: [85, 90],
    },
  },
};
```

### Report structure

For some reporters, you can change the summary and hierarchy of reported files using the option `defaultSummarizer`.

- `pkg`
  - The default setting
  - Lists every subdirectory path on the main index page
  - Shows the summary of the files in each subdirectory
  - You must click into each subdirectory to see files
- `nested`:
  - Displays nested file structure, like in your operating system or IDE
  - Shows a deep summary of all the contents of each directory
  - You must click through the directory structure to each file
- `flat`:
  - All files are in one flat list
  - No directory-based summaries
  - There is only one page of results

**Example HTML report structures:**

_Actual file structure:_

- js
  - a.js
  - controller
    - b.js
    - manager
      - factory
        - c.js

_pkg_:

- js
  - a.js
- js/controller
  - b.js
- js/controller/manager/factory
  - c.js

_nested_:

- a.js
- controller
  - b.js
  - manager
    - factory
      - c.js

_flat_:

- a.js
- controller/b.js
- controller/manager/factory/c.js

**Example flat-organization setting:**

```js
// web-test-runner.config.mjs

export default {
  coverageConfig: {
    reportDir: 'test-coverage',
    reporters: ['html'],
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
    defaultSummarizer: 'flat',
  },
};
```
