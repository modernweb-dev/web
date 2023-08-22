---
'@web/rollup-plugin-import-meta-assets': patch
---

Make import-meta-assets rollup plugin ignore patterns like "new URL('./', import.meta.url)" that reference directories.
