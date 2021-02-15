---
"@web/dev-server": patch
---

Migrate websocket endpoint away from '/' to '/wds'. This allows end users to potentially proxy web sockets with out colliding with WebDevServer's websocket.
