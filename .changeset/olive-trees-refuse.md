---
'@web/dev-server-core': patch
'@web/dev-server': patch
---

When serving content to an iframe within a csp restricted page, the websocket script may not be able to access the parent window.
Accessing it may result in an uncaught DOMException which we now handle.
