---
'@web/test-runner': patch
---

Adds a dot reporter a la mocha.

```js
import { dotReporter } from '@web/test-runner';
export default {
  reporters: [
    dotReporter()
  ]
}
```
