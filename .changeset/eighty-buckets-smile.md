---
'@web/dev-server': patch
---

Make sure to include the index.mjs in the npm package so es module users do have an valid entrypoint. Also include the typescript files in src so sourcemaps can point to them while debugging.
