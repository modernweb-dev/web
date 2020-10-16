# Dev Server >> Typescript and JSX ||50

To use typescript, JSX, or new JS features we recommend [esbuild](https://github.com/evanw/esbuild), a blazing fast build tool.

The `@web/dev-server-esbuild` plugin uses esbuild loaders for fast single file transformations, processing a single file within 0-5ms. It doesn't use the `esbuild` bundling API.

## JSX

Esbuild is great for transforming JSX to JS on the fly.

Install and add the plugin to your configuration. The `jsx: true` option will process all `.jsx` files automatically.

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [
    esbuildPlugin({
      jsx: true,
      // optional JSX factory and fragment
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
  ],
};
```

If you want to process JSX in JS files you can configure the loader explicitly:

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [
    esbuildPlugin({
      loaders: { '.js': 'jsx' },
      // optional JSX factory and fragment
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
  ],
};
```

## Typescript

The official typescript compiler (TSC) is the most predictable when it comes to compiling typescript, we generally recommend it for most users.

Esbuild can be used to compile code on the fly before serving to the browser. The benefit is that you don't need to serve from generated files, and the transformation is faster because it doesn't do any type checking. To keep type checking during development, you could run keep TSC running in the background with the `--noEmit`.

Example configuration:

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [esbuildPlugin({ ts: true })],
};
```

## JS Syntax

The esbuild [JS loader](https://esbuild.github.io/content-types/#javascript) has options available for modern JS syntax not yet available in all browsers, or only in the latest versions. You can configure the language target using the `target` option.

See the [supporting older browsers guide](./supporting-older-browsers.md) on how to set this up.
