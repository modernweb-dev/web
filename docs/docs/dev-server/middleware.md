# Dev Server >> Middleware ||5

You can add your own middleware to the dev server using the `middleware` property. The middleware should be a standard koa middleware. [Read more about koa here.](https://koajs.com/)

You can use middleware to modify responses to any request from the browser, for example, to rewrite a URL or proxy to another server. For serving or manipulating files it's recommended to use plugins.

## Proxying requests

<details>
  <summary>Read more</summary>

```javascript
import proxy from 'koa-proxies';

export default {
  port: 9000,
  middleware: [
    proxy('/api', {
      target: 'http://localhost:9001',
    }),
  ],
};
```

</details>

## Rewriting request urls

You can rewrite certain file requests using a middleware. This can be useful for example to serve your `index.html` from a different file location or to alias a module.

<details>
  <summary>Read more</summary>

Serve `/index.html` from `/src/index.html`:

```javascript
export default {
  middleware: [
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

## Reusing express middleware

It's possible to reuse middleware written in express using an adapter such as [express-to-koa](https://www.npmjs.com/package/express-to-koa).
