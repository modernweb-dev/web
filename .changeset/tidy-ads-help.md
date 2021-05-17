---
'@web/dev-server-rollup': patch
---

Support for subpath imports

👉 `my-pkg/package.json`

```json
{
  "name": "my-pkg",
  "imports": {
    "#internal-a": "./path/to/internal-a.js"
  }
}
```

👉 `my-pkg/src/file.js`

```js
import { private } from '#internal-a';
```

Subpath imports are not available to users of your package

👉 `other-pkg/src/file.js`

```js
// both will fail
import { private } from 'my-pkg#internal-a';
import { private } from 'my-pkg/path/to/internal-a.js';
```
