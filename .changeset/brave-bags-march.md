---
'@web/dev-server-core': major
---

Replace `chai` with `node:assert/strict` in the published `test-helpers` module. The `fetchText` helper now throws `node:assert`'s `AssertionError` instead of `chai`'s on non-200 responses.
