---
"@web/test-runner-core": patch
"@web/test-runner-visual-regression": minor
"@web/test-runner": patch
---

Add `buildCache` option to the visual regression config to support always saving the "current" screenshot.
Make the `update` option in the visual regression config _strict_, and only save "current" shots as "baseline" when it is set to `true`.
