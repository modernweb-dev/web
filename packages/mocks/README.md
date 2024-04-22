# @web/mocks

[`MSW`](https://mswjs.io/) integration layer for usage with [`@web/dev-server`](https://modern-web.dev/docs/dev-server/overview/), [`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview/) and [`@web/dev-server-storybook`](https://modern-web.dev/docs/dev-server/plugins/storybook/#mainjs-and-previewjs).

## Defining mocks

`feature-a/demo/mocks.js`:

```js
import { http } from '@web/mocks/http.js';
import mocksFromAnotherFeature from 'another-feature/demo/mocks.js';

/**
 * Define mock scenarios
 */
export default {
  /**
   * Return an object from the handler
   */
  default: [http.get('/api/foo', context => Response.json({ foo: 'bar' }))],
  /**
   * Return native `Response` object from the handler
   */
  error: [http.get('/api/foo', context => new Response('', { status: 400 }))],
  /**
   * Handle additional custom logic in the handler, based on url, searchparams, whatever
   */
  custom: [
    /**
     * Customize based on searchParams
     */
    http.get('/api/users', ({ request }) => {
      const searchParams = new URL(request.url).searchParams;

      if (searchParams.get('user') === '123') {
        return Response.json({ id: '123', name: 'frank' });
      }

      return Response.json({ id: '456', name: 'bob' });
    }),

    /**
     * Customize based on params
     */
    http.get('/api/users/:id', ({ params }) => {
      if (params.id === '123') {
        return new Response('', { status: 400 });
      }

      return Response.json({ id: '456', name: 'bob' });
    }),

    /**
     * Customize based on cookies
     */
    http.get('/api/abtest', ({ cookies }) => {
      return Response.json({ abtest: cookies.segment === 'business' });
    }),
  ],
  /**
   * Provide an async fn, a fn returning an object, a fn returning a Response, or just an object
   */
  returnValues: [
    http.get('/api/foo', async context => Response.json({ foo: 'bar' })),
    http.get(
      '/api/foo',
      async context => new Response(JSON.stringify({ foo: 'bar' }), { status: 200 }),
    ),
    http.get('/api/foo', context => Response.json({ foo: 'bar' })),
    http.get('/api/foo', context => new Response(JSON.stringify({ foo: 'bar' }), { status: 200 })),
  ],
  importedMocks: [
    mocksFromAnotherFeature.default,
    http.get('/api/foo', () => Response.json({ foo: 'bar' })),
  ],
};
```

### Context

The `context` object that gets passed to the handler includes:

```js
http.get('/api/foo', ({ request, cookies, params }) => {
  return Response.json({ foo: 'bar' });
});
```

- `request` the native `Request` object
- `cookies` an object based on the request cookies
- `params` an object based on the request params

## `@web/dev-server`/`@web/dev-server-storybook`/`@web/storybook-builder`

`feature-a/web-dev-server.config.mjs`:

```diff
+// for Storybook 7+ (@web/storybook-builder)
+// no need to do anything here
+// this file is not even needed for "@web/storybook-builder"

import { storybookPlugin } from '@web/dev-server-storybook';

+// for Storybook 6 (@web/dev-server-storybook)
+import { mockPlugin } from '@web/mocks/plugins.js';

export default {
  nodeResolve: true,
  plugins: [
+    // for Storybook 6 (@web/dev-server-storybook)
+    mockPlugin(),
    storybookPlugin({ type: 'web-components' })
  ],
};
```

You can also add the `mockRollupPlugin` to your `.storybook/main.cjs` config for when you're bundling your Storybook to deploy somewhere; your mocks will be deployed along with your Storybook, and will work in whatever environment you deploy them to.

`feature-a/.storybook/main.cjs`:

```diff
module.exports = {
  stories: ['../stories/**/*.stories.{js,md,mdx}'],
+  // for Storybook 7+ (@web/storybook-builder)
+  // no need to do anything here

+  // for Storybook 6 (@web/dev-server-storybook)
+  rollupConfig: async config => {
+    const { mockRollupPlugin } = await import('@web/mocks/plugins.js');
+    config.plugins.push(mockRollupPlugin());
+    return config;
+  },
};
```

<details>
<summary>
  <b><code>mockRollupPlugin</code> configuration options</b>
</summary>
The rollup plugin also takes an optional <code>interceptor</code>, which can be useful to handle things like rewriting <code>api.</code> prefixes made in requests, for example:

```js
mockRollupPlugin({
  interceptor: `
    const domain = window.location.hostname;
    const apiDomain = "api." + domain;

    const { fetch: originalFetch } = window;

    async function fetch(request) {
      request = new Request(request);

      const resolvedURL = new URL(request.url, window.location);
      if (resolvedURL.hostname === apiDomain) {
        // rewrite hostname without api.
        resolvedURL.hostname = domain;

        const init = {};
        for (const property in request) {
          init[property] = request[property];
        }

        request = new Request(resolvedURL.href, init);
        if (request.body != null) {
          request = new Request(request, { body: await request.arrayBuffer() });
        }
      }
      return originalFetch(request);
    }

    window.fetch = fetch;
  `,
});
```

This can be used to avoid CORS issues when deploying your Storybooks.

In the Storybook 7+ (@web/storybook-builder) you can achieve the same by using native Storybook API [previewHead](https://storybook.js.org/docs/api/main-config-preview-head):

```js
// .storybook/main.js
/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
  framework: {
    name: '@web/storybook-framework-web-components',
  },
  // ...
  previewHead(head) {
    return `
      ${process.env.NODE_ENV === 'production' ? `<script>${interceptor}</script>` : ''}
      ${head}
    `;
  },
};
export default config;
```

</details>
<br/>

And add the addon:
`feature-a/.storybook/main.cjs`:

```diff
module.exports = {
  stories: ['../stories/**/*.stories.{js,md,mdx}'],
+  // for Storybook 7+ (@web/storybook-builder)
+  addons: ['@web/mocks/storybook-addon'],

+  // for Storybook 6 (@web/dev-server-storybook)
+  addons: ['@web/mocks/storybook/addon.js'],
  rollupConfig: async config => {
    const { mockRollupPlugin } = await import('@web/mocks/plugins.js');
    config.plugins.push(mockRollupPlugin());
    return config;
  },
};
```

`feature-a/.storybook/preview.js`:

```diff
+// for Storybook 7+ (@web/storybook-builder)
+// no need to do anything here

+// for Storybook 6 (@web/dev-server-storybook)
+ import { withMocks } from '@web/mocks/storybook/decorator.js';
+ export const decorators = [withMocks];
```

`feature-a/stories/default.stories.js`:

```js
import { html } from 'lit';
import { http } from '@web/mocks/http.js';
import mocks from '../demo/mocks.js';

export const Default = () => html`<feature-a></feature-a>`;
Default.story = {
  parameters: {
    mocks: mocks.default,
    // or
    mocks: [
      mocks.default,
      otherMocks.error,
      http.get('/api/bar', () => Response.json({ bar: 'bar' })),
      http.post('/api/baz', () => new Response('', { status: 400 })),
    ],
    // or
    mocks: [
      http.get('/api/users/:id', ({ params }) => {
        if (params.id === '123') {
          return Response.json({ name: 'frank' });
        }
        return Response.json({ name: 'bob' });
      }),
    ],
  },
};
```

## `@web/test-runner`

The `registerMockRoutes` function will ensure the service worker is installed, and the `mockPlugin` takes care of resolving the service worker file, so users don't have to keep this one-time generated service worker file in their own project roots.

`feature-a/web-test-runner.config.mjs`:

```js
import { mockPlugin } from '@web/mocks/plugins.js';

export default {
  nodeResolve: true,
  files: ['test/**/*.test.js'],
  plugins: [mockPlugin()],
};
```

`feature-a/test/my-test.test.js`:

```js
import { registerMockRoutes } from '@web/mocks/browser.js';
import { http } from '@web/mocks/http.js';
import mocks from '../demo/mocks.js';
import featureBmocks from 'feature-b/demo/mocks.js';

describe('feature-a', () => {
  it('works', async () => {
    registerMockRoutes(http.get('/api/foo', () => Response.json({ foo: 'foo' })));

    const response = await fetch('/api/foo').then(r => r.json());
    expect(response.foo).to.equal('foo');
  });

  it('works', () => {
    registerMockRoutes(
      // Current project's mocks
      mocks.default, // is an array, arrays get flattened in the integration layer

      // Third party project's mocks, that uses a different version of MSW internally
      featureBmocks.default,

      // Additional mocks
      http.get('/api/baz', context => Response.json({ baz: 'baz' })),
    );
  });
});
```

## Mocking requests in node.js

You can also mock requests in node.js:

```js
import { registerMockRoutes } from '@web/mocks/node.js';
import { http } from '@web/mocks/http.js';

registerMockRoutes(
  http.get('/api/foo', () => new Response(JSON.stringify({ foo: 'bar' }), { status: 200 })),
);

const r = await fetch('/api/foo').then(r => r.json());
console.assert(r.foo === 'bar');
```

## Rationale

### Why not use MSW directly?

Large applications may have many features, that themself may depend on other features internally. Consider the following example:

`feature-a` uses `feature-b` internally. `feature-a` wants to reuse the mocks of `feature-b`, but the versions of msw are different.

- `feature-a` uses `msw@1.0.0`
- `feature-b` uses `msw@2.0.0`

```js
import mocks from '../demo/mocks.js';
import featureBmocks from 'feature-b/demo/mocks.js';

const Default = () => html`<feature-a></feature-a>`; // uses `feature-b` internally
Default.story = {
  parameters: {
    mocks: [
      mocks.default, // uses MSW@1.0.0
      featureBmocks.default, // ❌ uses MSW@2.0.0, incompatible mocks -> MSW@2.0.0 may expect a different service worker, or different API!
    ],
  },
};
```

`msw@2.0.0` may have a different API or it's service worker may expect a different message, event, or data format. In order to ensure forward compatibility, we expose a "middleman" function:

```js
import { http } from '@web/mocks/http.js';

http.get('/api/foo', () => Response.json({ foo: 'bar' }));
```

The middleware function simply returns an object that looks like:

```js
{
  method: 'get',
  endpoint: '/api/foo',
  handler: () => Response.json({foo: 'bar'})
}
```

This way we can support multiple versions of `msw` inside of our integration layer by acting as a bridge of sorts; the function people define mocks with doesn't directly depend on `msw` itself, it just creates an object with the information we need to pass on to msw.

That way, `feature-a`'s project controls the dependency on `msw` (via the msw integration layer package), while still being able to use mocks from other projects that may use a different version of `msw` themself internally.

In the wrapper, we standardize on native `Request` and `Response` objects; the handler function receives a `Request` object, and returns a `Response` object. For utility, we also pass `cookies` and `params`, since those are often used to conditionally return mocks. This means that the wrapper function only depends on standard, browser-native JS, and itself has no other dependencies, which is a good foundation to ensure forward compatibility.

### Requests/Responses

The `Request` and `Response` objects used are standard JS `Request` and `Response` objects. You can read more about them on MDN.
