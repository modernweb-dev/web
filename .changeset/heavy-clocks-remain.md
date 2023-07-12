---
'@web/mocks': patch
---

Export types like Mock & handler as well via the `types.js` entrypoint.

Example:

```js
// in TS
import { Mock } from '@web/mocks/types.js';

// or in JsDoc

/**
 * Gets mocks by given status
 * @param {number} status - response code status
 * @returns {import('@web/mocks/types.js').Mock[]}
 */
export function getMocksByStatus(status) {}
```
