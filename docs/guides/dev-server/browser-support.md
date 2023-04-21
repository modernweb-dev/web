# Dev Server >> Browser support ||80

Web Dev Server is based on development using features available in modern browsers. With the help of plugins, we can use the dev server on older browsers as well.

At a high level, we make a split between browsers that support modules and those that don't. We consider a browser as supporting es modules when it supports module scripts, dynamic imports, and `import.meta`.

Browsers that support es module are:

- Chrome 64 (and equivalent chromium based browsers)
- Firefox 67
- Safari 11.1 and higher.

## JS syntax

When testing on older browsers, you might use javascript features that are not yet available. We can use the [esbuild plugin](../../docs/dev-server/plugins/esbuild.md) to transform javascript using the the `target` option. Esbuild supports javascript down to es2016, making it unsuitable for legacy browsers like IE11 which need es5 support.

We recommended setting the target to `auto`. This will skip work on the latest versions of chrome and firefox while transforming modern JS syntax on older browsers and safari (safari is excluded because the release cycle is slower).

The easiest way to set this is by using the command line flag.

Make sure you install the plugin first:

```
npm i --save-dev @web/dev-server @web/dev-server-esbuild
```

Then, set the command line flag:

```
npx web-dev-server --open /demo/ --esbuild-target auto
```

If you're using new syntax that is not yet available on the latest chrome or firefox you can force the transformations as well using the `auto-always` flag:

```
npx web-dev-server --open /demo/ --esbuild-target auto-always
```

The target flag can also be set when using the plugin programmatically:

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [esbuildPlugin({ target: 'auto', ts: true })],
};
```

Read more about the esbuild plugin [here](../../docs/dev-server/plugins/esbuild.md).

## Legacy browsers

If you need to test on browsers that don't support es modules and modern javascript, such as Internet Explorer 11, you can use the `@web/dev-server-legacy` plugin.

Install the plugin:

```
npm i --save-dev @web/dev-server @web/dev-server-esbuild
```

Add a `web-dev-server.config.mjs`:

```js
import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  plugins: [
    // make sure this plugin is always last
    legacyPlugin(),
  ],
};
```

This plugin will polyfill es modules, transform your code to es5, and add polyfills for common browser features.

Read more about the legacy plugin [here](../../docs/dev-server/plugins/legacy.md).

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/dev-server).
See the [documentation of @web/dev-server](../../docs/dev-server/overview.md).
