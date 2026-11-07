---
'@web/dev-server-core': minor
'@web/dev-server': minor
---

Add an `https` option to serve over HTTPS with HTTP/1.1, without enabling HTTP/2. It uses `sslKey`/`sslCert`, falling back to the bundled self-signed certificate like `http2` does.
