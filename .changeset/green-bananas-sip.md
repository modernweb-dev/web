---
'@web/dev-server-esbuild': patch
---

Add a `tsconfig` option which can be pointed towards your tsconfig.json to keep esbuild and typescript in sync.

Usage example:

```js
import { fileURLToPath } from 'url';
esbuildPlugin({
  ts: true,
  tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
});
```

Note: Without the above code the `tsconfig.json` file will not be used.
