# Dev server polyfill

Plugin to load polyfills during development. Uses [`@web/polyfills-loader`](https://modern-web.dev/docs/building/polyfills-loader/) internally.

## Usage

`web-dev-server.config.js`:

```js
import { polyfill } from '@web/dev-server-polyfill';

export default {
  plugins: [
    polyfill({
      scopedCustomElementRegistry: true,
    }),
  ],
};
```

You can find the supported polyfills [here](https://modern-web.dev/docs/building/polyfills-loader/#polyfills).

You can also provide custom polyfills:

`web-dev-server.config.js`:

```js
import { polyfill } from '@web/dev-server-polyfill';

export default {
  plugins: [
    polyfill({
      custom: [
        {
          name: 'my-feature-polyfill',
          path: 'path/to/my/polyfill.js',
          test: "!('myFeature' in window)",
        },
      ],
    }),
  ],
};
```

You can find the configuration options for providing custom polyfills [here](https://modern-web.dev/docs/building/polyfills-loader/#custom-polyfills).
