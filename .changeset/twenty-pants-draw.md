---
'@web/test-runner-mocha': patch
---

Remove `@types/mocha` from dependencies so its global types don't leak into user code.
