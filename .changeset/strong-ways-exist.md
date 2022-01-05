---
'@web/test-runner': patch
---

Adds a summary reporter which lists all the tests run when the test runner finishes.

```js
import { summaryReporter } from '@web/test-runner';
export default {
  reporters: [
    summaryReporter()
  ]
}
```

If you'd like to flatten the suite names, so that each test is reported with it's full chain of suite titles, set the `flatten` option to true.

```js
summaryReporter({ flatten: true })
```
