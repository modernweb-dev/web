# Dev Server >> Proxy to other servers ||30

When running the dev server you may want to redirect some requests from the browser to another server, for example, an API. This could be a server on your localhost or an external address.

The dev server exposes a middleware option where we can intercept requests and responses. We can write these ourselves, but since the dev server is based on [Koa](https://koajs.com/) we can reuse any valid koa middleware as well. We can also use express middleware using an adapter such as [express-to-koa](https://www.npmjs.com/package/express-to-koa).

## Create an example server

To start, let's create a simple local API for our project. Create `api-server.mjs` in your project with this content:

```js
import http from 'http';

const server = http.createServer((request, response) => {
  if (request.url === '/api/message') {
    response.writeHead(200);
    response.end('Hello from API');
  }
});

server.listen(9000);
```

## Add a proxy to your server config

Next, let's install the required dependencies:

```
npm install --save-dev @web/dev-server koa-proxies
```

Add the middleware to our `web-dev-server.config.mjs`, forwarding all requests that start with `/api/` to our local server:

```js
import proxy from 'koa-proxies';
import './api-server.mjs';

export default {
  port: 8000,
  middleware: [
    proxy('/api/', {
      target: 'http://localhost:9000/',
    }),
  ],
};
```

## Making the request

Finally, we can update our `demo/index.html` to make a request to the API endpoint we defined.

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="message"></div>

    <script type="module">
      async function fetchMessage() {
        const response = await fetch('/api/message');
        const message = await response.text();
        document.getElementById('message').textContent = message;
      }

      fetchMessage();
    </script>
  </body>
</html>
```

Start the server using:

```
npx web-dev-server --open /demo/
```

We should now see the message from the local API server printed to the screen.

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/dev-server).
See the [documentation of @web/dev-server](../../docs/dev-server/overview.md).
