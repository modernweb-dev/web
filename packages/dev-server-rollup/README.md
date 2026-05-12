# Dev Server Rollup

Adapter for using rollup plugins and Vite plugins in Web Dev Server and Web Test Runner.

See [our website](https://modern-web.dev/docs/dev-server/plugins/rollup/) for full documentation.

## Using Rollup Plugins

```js
// web-dev-server.config.mjs
import { fromRollup } from '@web/dev-server-rollup';
import rollupReplace from '@rollup/plugin-replace';

const replace = fromRollup(rollupReplace);

export default {
  plugins: [replace({ 'process.env.NODE_ENV': '"development"' })],
};
```

## Using Vite Plugins

`@web/dev-server-rollup` ships a `fromVite` adapter that lets you use Vite plugins
with Web Dev Server.

### Supported hooks

| Hook | Description |
|---|---|
| `resolveId` | Resolve module imports |
| `load` | Serve virtual/custom modules |
| `transform` | Transform JS modules and inline scripts in HTML |
| `transformIndexHtml` | Transform HTML files |
| `configureServer` | Add custom Koa-compatible middleware |
| `apply` | `'serve'` plugins are included; `'build'` plugins are skipped |

> Vite-specific build-only hooks (`config`, `configResolved`, `handleHotUpdate`,
> `configurePreviewServer`) are silently ignored.

### Basic usage with `fromVite`

```js
// web-dev-server.config.mjs
import { fromVite } from '@web/dev-server-rollup';
import viteFoo from 'vite-plugin-foo';

export default {
  plugins: [fromVite(viteFoo)({ option: 'value' })],
};
```

If the plugin is already instantiated, wrap it in an arrow function:

```js
import { fromVite } from '@web/dev-server-rollup';
import viteFoo from 'vite-plugin-foo';

const fooPlugin = viteFoo({ option: 'value' });

export default {
  plugins: [fromVite(() => fooPlugin)()],
};
```

### Direct adapter with `viteAdapter`

Use `viteAdapter` when you have a Vite plugin object and want to wrap it directly:

```js
import { viteAdapter } from '@web/dev-server-rollup';

const myPlugin = {
  name: 'my-plugin',
  transform(code, id) {
    if (id.endsWith('.foo')) {
      return `export default ${JSON.stringify(code)}`;
    }
  },
};

export default {
  plugins: [viteAdapter(myPlugin)],
};
```

### Writing an inline Vite plugin

```js
import { viteAdapter } from '@web/dev-server-rollup';

export default {
  plugins: [
    viteAdapter({
      name: 'virtual-module',
      resolveId(id) {
        if (id === 'virtual:config') return '\0virtual:config';
      },
      load(id) {
        if (id === '\0virtual:config') {
          return `export const config = { env: 'development' };`;
        }
      },
    }),
  ],
};
```

### `transformIndexHtml` — injecting tags

```js
import { viteAdapter } from '@web/dev-server-rollup';

export default {
  plugins: [
    viteAdapter({
      name: 'inject-tag',
      transformIndexHtml() {
        return [
          {
            tag: 'script',
            attrs: { src: '/polyfill.js' },
            injectTo: 'head-prepend',
          },
        ];
      },
    }),
  ],
};
```

### `configureServer` — custom middleware

```js
import { viteAdapter } from '@web/dev-server-rollup';

export default {
  plugins: [
    viteAdapter({
      name: 'custom-api',
      configureServer(server) {
        server.middlewares.use('/api', (req, res, next) => {
          if (req.url === '/hello') {
            res.end(JSON.stringify({ hello: 'world' }));
          } else {
            next();
          }
        });
      },
    }),
  ],
};
```

