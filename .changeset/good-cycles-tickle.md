---
'@web/dev-server': patch
'@web/dev-server-core': patch
'@web/dev-server-rollup': patch
---

fix handling of paths resolved outside the root dir. we now correctly use the resolved path when resolving relative imports and when populating the transform cache
