---
'@web/dev-server-core': patch
---

Expose webSocketServer on the WebSocketManager in case developers using the Node API want apply their own WebSocket message handling, but reusing the WebSocket Server of the dev server.
