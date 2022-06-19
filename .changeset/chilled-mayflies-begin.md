---
'@web/test-runner': patch
'@web/test-runner-commands': patch
'@web/test-runner-core': patch
---

- improve caching of snapshots in-memory
- don't block browser command on writing snapshot to disk
- don't write snapshot to disk for each change, batch write per file
