# Dev Server Core

## Projects

- `@web/dev-server-core` implements the basics of the server.
- `@web/dev-server` reads command line args, starts the dev server, and adds default opinionated plugins and logger.
- `@web/config-loader` is used to read the config.

The other `@web/dev-server-` packages are plugins for adding new functionalities. Specifically `@web/dev-server-rollup` contains the adapter for using rollup plugins.

## Middleware

The dev server is based on Koa, we use it's middleware architecture to structure the lifecycle of the server. Most server functionalities are implemented as koa middleware, and some as dev server plugins.

The plugin system is implemented as middleware as well, plugins hooks are called from middleware.

When a request comes in and itis processed by the server's middleware in the order that they are defined. Users can define custom middleware in the config, which run before the built-in middleware.

## Setup

The main entrypoint for dev server is the `DevServer` class. This takes a configuration object and sets up the koa server, middleware and plugins.

The server is started and stopped using the `.start` and `.stop` methods. You can access the underlying koa app, HTTP server and websockets manager from the dev server instance.

```js
import { DevServer } from '@web/dev-server-core';

const server = new DevServer(config, logger);
await server.start();

console.log(server.koaApp);
console.log(server.server);
console.log(server.webSockets);

await server.stop();
```

## Code transformation pipeline

When a file is served by the server we call each plugin with a `transform` hook in the order that they appear.

Normally files are served as a stream to the browser. To make it easier to do code transformation, we drain the stream before we call plugin hooks. This way `context.body` inside a plugin is always a string with the full file content. We skip transform for binary files, like images and videos.

### Transforming module imports

One of the built-in plugins uses the `transform` hook to rewrite es module imports. It runs last after other plugins, it analyzes module imports and calls the `resolveImport` and `transformImport` plugin hooks.

As soon as a plugin returns a result for `resolveImport` we stop, and don't call the hook on the other plugins. This is typically used for resolving bare imports. `transformImport` is always called for each plugin, this is typically used to append URL parameters.

### Transform cache

After transformation we store the result in a cache, keyed by the request URL. When a request for the same file is made again, it's served from this cache. To bust the cache we watch the served files on the file system using the `chokidar` library. When a file is edited, moved or deleted, we remove it from the cache.

By default the transform cache assumed that transformation is the same for any given request URL. Sometimes this isn't the case, for example in the case of the legacy plugin which does a transformation based on the user agent. The `transformCacheKey` hook can be used to define a different key for the transform cache.

## Caching mechanisms

The dev server has two caching mechanisms, the browser cache and the transform cache

The browser cache is based on [etags](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag). Each response of the dev server is accompanied with a timestamp of the last time the file was modified. When a file is requested for a second time, for example after a refresh, the browser compares the new timestamp with the previous and if there was no change it will skip downloading and use it from the browser cache.

Etag based caching still reads the file from disk, and potentially triggers transformations. This is why we also have a transform cache, as described above. This way we can serve directly from memory.

A potential improvement could be to use long term caching in the browser, so that it doesn't need to consult the server for any cache validation. This might be useful for packages in node_modules. The challenge to solve here is a smart way of invalidating this cache.
