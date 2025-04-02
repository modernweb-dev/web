---
'@web/config-loader': patch
---

Optimizes config loading to not look for `package.json` in file system if the
config extension is already informing whether CommonJS or ESM is used.

Currently config loading did unnecessarily traverse the file system. This could
be unnecessary slowness, or cause issues in sandbox environments (like Bazel)
