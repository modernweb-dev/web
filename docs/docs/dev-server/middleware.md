---
title: Dev Server Middleware
eleventyNavigation:
  key: Middleware
  parent: Dev Server
  order: 10
---

You can add your own middleware to the dev server using the `middleware` property. The middleware should be a standard koa middleware. [Read more about koa here.](https://koajs.com/)

You can use middleware to modify respond to any request from the browser, for example to rewrite a URL or proxy to another server. For serving or manipulating files it's recommended to use plugins.

### Proxying requests

<details>
  <summary>Read more</summary>

```javascript
const proxy = require('koa-proxies');

module.exports = {
  port: 9000,
  middlewares: [
    proxy('/api', {
      target: 'http://localhost:9001',
    }),
  ],
};
```

</details>

### Rewriting request urls

You can rewrite certain file requests using a simple middleware. This can be useful for example to serve your `index.html` from a different file location or to alias a module.

<details>
  <summary>Read more</summary>

Serve `/index.html` from `/src/index.html`:

```javascript
module.exports = {
  middlewares: [
    function rewriteIndex(context, next) {
      if (context.url === '/' || context.url === '/index.html') {
        context.url = '/src/index.html';
      }

      return next();
    },
  ],
};
```

</details>
