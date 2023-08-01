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

const workboxConfig = require('./workbox-config.js');

module.exports = {
  // ...
  plugins: [
    generateSW(workboxConfig, {
      render: ({ swDest, count, size }) => {
        console.log('📦', swDest, '#️⃣', count, '🐘', size);
      },
    }),
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

const workboxConfig = require('./workbox-config.js');

module.exports = {
  // ...
  plugins: [
    injectManifest(workboxConfig, {
      render: ({ swDest, count, size }) => {
        console.log('📦', swDest, '#️⃣', count, '🐘', size);
      },
    }),
  ],
};
```

### Bundling

When using `injectManifest`, your service worker will also automatically get bundled via `esbuild`. During bundling, any mentions of Workbox's internal usage of `process.env` variables will also be replaced, so you'll end up with a service worker that will have browser-compatible syntax only.

You can override the `esbuild` options used like so:

```js
const { injectManifest } = require('rollup-plugin-workbox');

const workboxConfig = require('./workbox-config.js');

module.exports = {
  // ...
  plugins: [
    injectManifest(workboxConfig, {
      esbuild: {
        minify: false,
      },
    }),
  ],
};
```
