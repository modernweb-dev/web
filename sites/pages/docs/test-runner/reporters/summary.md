# Test Runner >> Reporters >> Summary ||30

Mocha-style summary reporter for Web Test Runner

## Configuration

Web test runner summary reporter accepts a single option:

| Option    | Type    | Default | Description                                         |
| --------- | ------- | ------- | --------------------------------------------------- |
| `flatten` | boolean | `false` | When true, reports the full suite name on each line |

## Example

```js
import { summaryReporter } from '@web/test-runner';

export default {
  nodeResolve: true,
  reporters: [summaryReporter()],
};
```
