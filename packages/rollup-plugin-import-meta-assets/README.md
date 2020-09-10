# Rollup Plugin import-meta-assets

Rollup plugin that detects assets references relative to modules using patterns such as `new URL('./path/to/asset.ext', import.meta.url)`. The assets are added to the rollup pipeline, allowing them to be transformed and hash the filenames.

## Install

Using npm:

```
npm install @web/rollup-plugin-import-meta-assets --save-dev
```

## Usage

Create a rollup.config.js [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';

export default {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'es',
  },
  plugins: [importMetaAssets()],
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Documentation

See [our website](https://modern-web.dev/docs/building/rollup-plugin-import-meta-assets/) for full documentation.
