# Building >> Rollup Plugin Import Meta Assets ||30

Rollup plugin that detects assets references relative to modules using patterns such as `new URL('./assets/my-img.png', import.meta.url)`.

The referenced assets are added to the rollup pipeline, allowing them to be transformed and hash the filenames.

## How it works

A common pattern is to import an asset to get the URL of it after bundling:

```js
import myImg from './assets/my-img.png';
```

This doesn't work in the browser without transformation. This plugin makes it possible to use an identical pattern using `import.meta.url` which does work in the browser:

```js
const myImg = new URL('./assets/my-img.png', import.meta.url);
```

### Dynamic variables

You can also use dynamic variables like so:

```js
const myImg = new URL(`./assets/${myImg}.png`, import.meta.url);
```

Please consult the [dynamic-import-vars plugin](https://github.com/rollup/plugins/blob/master/packages/dynamic-import-vars) documentation for options and limitations.

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

## Options

### `exclude`

Type: `String` | `Array[...String]`<br>
Default: `null`

A [picomatch pattern](https://github.com/micromatch/picomatch#globbing-features), or array of patterns, which specifies the files in the build the plugin should _ignore_.
By default no files are ignored.

### `include`

Type: `String` | `Array[...String]`<br>
Default: `null`

A [picomatch pattern](https://github.com/micromatch/picomatch#globbing-features), or array of patterns, which specifies the files in the build the plugin should operate on.
By default all files are targeted.

### `warnOnError`

Type: `Boolean`<br>
Default: `false`

By default, the plugin quits the build process when it encounters an error. If you set this option to true, it will throw a warning instead and leave the code untouched.

### `transform`

Type: `Function`<br>
Default: `null`

By default, referenced assets detected by this plugin are just copied as is to the output directory, according to your configuration.

When `transform` is defined, this function will be called for each asset with two parameters, the content of the asset as a [Buffer](https://nodejs.org/api/buffer.html) and the absolute path.
This allows you to conditionally match on the absolute path and maybe transform the content.

When `transform` returns `null`, the asset is skipped from being processed.

In this example, we use it to optimize SVG images with [svgo](https://github.com/svg/svgo):

```js
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
const svgo = new SVGO({
  // See https://github.com/svg/svgo#what-it-can-do
  plugins: [
    /* plugins here */
  ],
});

export default {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'es',
  },
  plugins: [
    importMetaAssets({
      transform: (assetBuffer, assetPath) => {
        return assetPath.endsWith('.svg')
          ? svgo.optimize(assetBuffer.toString()).then(({ data }) => data)
          : assetBuffer;
      },
    }),
  ],
};
```

## Examples

Source directory:

```
.
├── one
│   └── two
│       └── the-image.svg
├──
└── entrypoint.js
```

With `entrypoint.js` containing this:

```js
const imageUrl = new URL('./one/two/the-image.svg', import.meta.url).href;
console.log(imageUrl);
```

Output directory:

```
.
├── assets
│   └── the-image.svg
└── bundle.js
```

With `bundle.js` containing this:

```js
const imageUrl = new URL(new URL('asset/the-image.svg', import.meta.url).href, import.meta.url)
  .href;
console.log(imageUrl);
```
