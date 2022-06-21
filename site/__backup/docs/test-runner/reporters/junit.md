# Test Runner >> Reporters >> JUnit ||20

JUnit XML reporter for web test runner

## Configuration

Web test runner JUnit reporter accepts two options:

| Option       | Type    | Default                | Description                                                                       |
| ------------ | ------- | ---------------------- | --------------------------------------------------------------------------------- |
| `outputPath` | string  | `'./test-results.xml'` | file path (including extension) to write results to. Will be resolved from `cwd`. |
| `reportLogs` | boolean | `false`                | Whether to report browser logs in the xml file's `system-out` element             |

## Example

```js
import { defaultReporter } from '@web/test-runner';
import { junitReporter } from '@web/test-runner-junit-reporter';

export default {
  nodeResolve: true,
  reporters: [
    // use the default reporter only for reporting test progress
    defaultReporter({ reportTestResults: false, reportTestProgress: true }),
    // use another reporter to report test results
    junitReporter({
      outputPath: './results/test-results.xml', // default `'./test-results.xml'`
      reportLogs: true, // default `false`
    }),
  ],
};
```
