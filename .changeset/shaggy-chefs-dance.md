---
'@web/test-runner-core': patch
---

Improve debug message for test runner uncaught exceptions

This should make debugging easier. It wasn't very easy to figure out
where the errors originated from (because of how the actual uncaught
exception only happened with many concurrent builds inside a sandbox
environment that is hard to debug).
