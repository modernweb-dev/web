---
'@web/test-runner-chrome': patch
---

fix: add workaround for headless issue

This will patch `window.requestAnimationFrame` and `window.requestIdleCallback` and make sure that the tab running the test code is brought back to the front.
