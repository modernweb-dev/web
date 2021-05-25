---
'@web/rollup-plugin-copy': minor
---

Added `exclude` option for rollup-plugin-copy.

Example: Exclude single directory:

```js
copy({ pattern: '**/*.svg', exclude: 'node_modules' })
```

Example: Exclude multiple globs:

```js
copy({ pattern: '**/*.svg', exclude: ['node_modules', 'src/graphics'] })
```
