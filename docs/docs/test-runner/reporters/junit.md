---
title: JUnit
eleventyNavigation:
  key: JUnit
  parent: Reporters
  order: 20
---

JUnit XML reporter for web test runner

## Configuration

Web test runner JUnit reporter accepts two options:

| Option       | Type    | Default                | Description                                                                       |
| ------------ | ------- | ---------------------- | --------------------------------------------------------------------------------- |
| `outputPath` | string  | `'./test-results.xml'` | file path (including extension) to write results to. Will be resolved from `cwd`. |
| `reportLogs` | boolean | `false`                | Whether to report browser logs in the xml file's `system-out` element             |

## Example

```js
import { defaultReporter } from '@web/test-runner-cli';
import { junitReporter } from '@web/test-runner-junit-reporter';

export default {
  nodeResolve: true,
  reporters: [
    // add the default reporter if you want to retain the test runner reporting in the CLI
    defaultReporter(),
    junitReporter({
      outputPath: './results/test-results.xml', // default `'./test-results.xml'`
      reportLogs: true, // default `false`
    }),
  ],
};
```
