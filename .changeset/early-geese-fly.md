---
'@web/rollup-plugin-import-meta-assets': minor
---

Add option `preserveDynamicStructure` that emits dynamic assets and rewrites the URL pattern to resolve the original dynamic path relative to the first emitted asset.
It requires that the output preserves both filenames (no hashing) and directory structure from the dynamic expression onwards.
