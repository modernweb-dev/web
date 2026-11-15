---
'@web/dev-server-core': patch
---

Store the bound port in `config.port`, so `port: 0` reports the real port.
