---
'@web/test-runner': minor
'@web/test-runner-core': minor
---

improve serialization of stack traces cross-browser

this adds two breaking changes, which should not affect most users:

- removed `userAgent` field from `TestSession`
- test reporter `reportTestFileResults` is no longer async
