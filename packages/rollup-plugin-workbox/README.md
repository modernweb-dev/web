# rollup-plugin-workbox

[![Published on npm](https://img.shields.io/npm/v/rollup-plugin-workbox.svg)](https://www.npmjs.com/package/rollup-plugin-workbox)

Rollup plugin that builds a service worker with workbox as part of your rollup build

## Usage

This package provides two rollup plugins: one that generates a complete service worker for you and one that generates a list of assets to precache that is injected into a service worker file.

The plugins are implemented as two function in the rollup-plugin-workbox module, named `generateSW` and `injectManifest`.

### `generateSW`

Import the `generateSW` plugin from `rollup-plugin-workbox`, and add it to your `plugins` array in your `rollup.config.js`. The plugin takes a workbox config object, and an optional render function as the second argument.

You can find a detailed list of supported properties for the workbox config object [here](https://developers.google.com/web/tools/workbox/modules/workbox-build#generatesw_mode).

```js
const { generateSW } = require('rollup-plugin-workbox');

module.exports = {
  input: 'main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
  },
  plugins: [
    generateSW({
      swDest: '/dist/sw.js',
      globDirectory: 'demo/dist/',
    }),
  ],
};
```

You can also `require` your `workbox-config.js` file and pass it to the plugin.

```js
const { generateSW } = require('rollup-plugin-workbox');

const workboxConfig = require('./workbox-config.js');

module.exports = {
  // ...
  plugins: [generateSW(workboxConfig)],
};
```

You can also customize the console output after workbox has generated your service worker by passing an optional render function as the second argument to the plugin:

```js
const { generateSW } = require('rollup-plugin-workbox');

const workboxConfig = require('./workbox-config.js')

module.exports = {
  // ...
  plugins: [
    generateSW(
      workboxConfig,
      function render({ swDest, count, size }) {
        console.log(
          '📦', swDest,
          '#️⃣', count,
          '🐘', size,
        );
      }),
    )
  ],
};
```

### `injectManifest`

Import the `injectManifest` plugin from `rollup-plugin-workbox`, and add it to your `plugins` array in your `rollup.config.js`. The plugin takes a workbox config object, and an optional render function as the second argument.

You can find a detailed list of supported properties for the workbox config object [here](https://developers.google.com/web/tools/workbox/modules/workbox-build#injectmanifest_mode).

```js
const { injectManifest } = require('rollup-plugin-workbox');

module.exports = {
  input: 'main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
  },
  plugins: [
    injectManifest({
      swSrc: 'sw.js',
      swDest: '/dist/sw.js',
      globDirectory: 'demo/dist/',
    }),
  ],
};
```

You can also `require` your `workbox-config.js` file and pass it to the plugin.

```js
const { injectManifest } = require('rollup-plugin-workbox');

const workboxConfig = require('./workbox-config.js');

module.exports = {
  // ...
  plugins: [injectManifest(workboxConfig)],
};
```

You can also customize the console output after workbox has created your service worker by passing an optional render function as the second argument to the plugin:

```js
const { injectManifest } = require('rollup-plugin-workbox');

const workboxConfig = require('./workbox-config.js')

module.exports = {
  // ...
  plugins: [
    injectManifest(
      workboxConfig,
      function render({ swDest, count, size }) {
        console.log(
          '📦', swDest,
          '#️⃣', count,
          '🐘', size,
        );
      }),
    )
  ],
};
```

### A note on the `mode` config property

The `generateSW` mode of Workbox supports a `mode` property, that when set to `'production'` will bundle your generated service worker, and get rid of any `process.env.NODE_ENV` variables that are internally used in the Workbox libraries.

Unfortunately this got [wrongfully documented](https://github.com/GoogleChrome/workbox/issues/2427) for `injectManifest`, and this means that `injectManifest` does not actually support the `mode` property. There is a feature request on the [Workbox repo](https://github.com/GoogleChrome/workbox/issues/2588) to support this feature for `injectManifest` as well.

Until this gets fixed in `workbox-build`, `rollup-plugin-workbox` **does** support the `mode` property in the Workbox configuration for `injectManifest`, and when set to `'production'` will output a production optimized service worker for you.

```diff
const { injectManifest } = require('rollup-plugin-workbox');

module.exports = {
  input: 'main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
  },
  plugins: [
    injectManifest({
      swSrc: 'sw.js',
      swDest: '/dist/sw.js',
      globDirectory: 'demo/dist/',
+     mode: 'production',
    })
  ],
};
```
