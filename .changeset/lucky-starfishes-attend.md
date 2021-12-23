---
'@web/test-runner-core': patch
---

Evaluate `files` as a glob list, rather than adding the result of each string to the file list.
This allow `files` glob exclude patterns e.g.

```js
export default {
  files: [
    '**/*.spec.ts', // include `.spec.ts` files
    '!**/*.e2e.spec.ts', // exclude `.e2e.spec.ts` files
    '!**/node_module/**/*', // exclude any node modules
  ],
};
```

If you were relying on each glob string pattern being evaluated on it's own, this is a breaking change.
