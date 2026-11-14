---
'@web/dev-server-core': patch
---

Reject `start()` with the `EADDRINUSE` error when the port is in use, instead of crashing the process with an uncaught exception.
