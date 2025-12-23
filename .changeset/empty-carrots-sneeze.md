---
'@web/rollup-plugin-html': major
---

1. Enabled CSS assets extraction by default (as a result, removed configuration option bundleAssetsFromCss).
2. Made extraction of assets from all link rel types
3. Fixed "assetFileNames" behavior
4. Refactored all tests, added tests for more corner cases
5. Added legacy modes for old 2.x.x behavior.

See MIGRATION.md for migration notes.
