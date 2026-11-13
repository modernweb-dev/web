---
'@web/dev-server-core': patch
---

Store a transformed file in the plugin transform cache before the response is sent. A request that follows right away now uses the cache instead of running the transform again.
