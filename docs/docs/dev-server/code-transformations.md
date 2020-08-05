---
title: Code transformations
eleventyNavigation:
  key: Code Transformations
  parent: Dev Server
  order: 100
---

In `@web/dev-server` and `@web/test-runner` you can add plugins to transform code. On this page, we will look at some common patterns.

## Plugins

Generally speaking, the two most important plugins are [@web/dev-server-esbuild](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-esbuild) and [@web/dev-server-rollup](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-rollup). Esbuild can be used for fast transformations, while rollup has a rich plugin ecosystem we can reuse here.

Some of the examples require you to write your own plugin. The examples are straight forward, but you can check the [server plugins](https://github.com/modernweb-dev/web/blob/master/packages/dev-server-core/docs/server-plugins.md) docs for a more detailed explanation.

## Typescript

### esbuild

To use typescript we recommend using [@web/dev-server-esbuild](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-esbuild) to transform TS to JS on the fly. It is the fastest approach, introducing only a few milliseconds overhead.

<details>

<summary>View example</summary>

Note that `esbuild` doesn't do any type checking, you can run `tsc` as a separate step for linting your types only.

See [this project](https://github.com/modernweb-dev/web/tree/master/demo/projects/lit-element-ts) for an example setup.

```js
const { esbuildPlugin } = require('@web/dev-server-esbuild');

module.exports = {
  plugins: [esbuildPlugin({ ts: true })],
};
```

</details>

### tsc

You can use `tsc`, the official typescript compiler, to transform TS to JS as well. It is the most stable option as this is the official tool, but it is slower and you need to run it before running tests or dev server.

<details>

<summary>View example</summary>

If you rely on the specific behavior of `tsc`, for example when using some of the advanced options in the `tsconfig`, this is a good option.

See [this project](https://github.com/modernweb-dev/web/tree/master/demo/projects/lit-element-tsc) for an example setup.

</details>

## Other module formats

The browser only supports standard es modules, using `import` and `export` statements. Check out [es modules docs](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-core/docs/es-modules.md) to learn more about using es modules and supporting other module formats such as CommonJS and UMD.

## Environment variables

### Virtual module

To use environment variables in your project we recommend creating a virtual module.

<details>

<summary>View example</summary>

Import the environment module in your code. Make sure it is a browser compatible import path:

```js
import { version } from '../environment.js';

console.log(`The current version is: ${version}`);
```

Add a plugin to serve the contents of this environment:

```js
const packageJson = require('./package.json');

module.exports = {
  plugins: [
    {
      name: 'env-vars',
      serve(context) {
        if (context.path === '/environment.js') {
          return `export default { version: "${packageJson.version}" }`;
        }
      },
    },
  ],
};
```

</details>

### Constants replacement

Another approach is to replace constants or patterns in your code. We don't recommend this because it relies on magic variables, and requires a build step for your code to work.

<details>

<summary>View example</summary>

You can use the [@rollup/plugin-replace](https://www.npmjs.com/package/@rollup/plugin-replace) for replacing environment variables in your code. Make sure to add an `include` pattern to avoid processing files unnecessarily.

```js
const rollupReplace = require('@rollup/plugin-replace');
const { fromRollup } = require('@web/dev-server-rollup');

const replace = fromRollup(rollupReplace);

module.exports = {
  plugins: [replace({ include: ['src/**/*.js'], __environment__: '"development"' })],
};
```

</details>

## Mocking or stubbing modules

Es modules are immutable, you cannot mock or stub them at runtime in the browser. You can however serve a mock or stub version from the webserver. In the test runner, this affects all tests, you cannot do this per test file.

<details>
<summary>View example</summary>

```js
module.exports = {
  plugins: [
    {
      name: 'stub-package',
      serve(context) {
        if (context.path === '/node_modules/some-package/index.js') {
          return `
export default doFoo() {
  console.log("stubbing foo");
}

export default doBar() {
  console.log("stubbing bar");
}`;
        }
      },
    },
  ],
};
```

</details>

## Babel

You can use [@rollup/plugin-babel](https://www.npmjs.com/package/@rollup/plugin-babel) to use babel plugins (it's plugin-ception!).

Note that the dev server and test runner already includes `esbuild` for compiling javascript for compatibility with older browsers. You don't need to use babel for that.

<details>
<summary>View example</summary>

```js
const rollupBabel = require('@rollup/plugin-babel');
const { fromRollup } = require('@web/dev-server-rollup');

const babel = fromRollup(rollupBabel);

module.exports = {
  plugins: [babel({ include: ['src/**/*.js'], plugins: ['babel-plugin-foo'] })],
};
```

</details>

## JSX and TSX

You can use [@web/dev-server-esbuild](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-esbuild) to handle JSX and TSX files. Check the demos for [JSX](https://github.com/modernweb-dev/web/tree/master/demo/projects/preact-jsx) and [TSX](https://github.com/modernweb-dev/web/tree/master/demo/projects/preact-tsx)

## Importing JSON

To import JSON files you can use [@rollup/plugin-json](https://www.npmjs.com/package/@rollup/plugin-json)

<details>
<summary>View example</summary>

In addition to installing the rollup plugin, we need to tell the dev server to serve json files as js modules:

```js
const rollupJson = require('@rollup/plugin-json');
const { fromRollup } = require('@web/dev-server-rollup');

const json = fromRollup(rollupJson);

module.exports = {
  plugins: [
    {
      name: 'json-mime-type',
      resolveMimeType(context) {
        if (context.path.endsWith('.json')) {
          return 'js';
        }
      },
    },
    json({}),
  ],
};
```

</details>

## Importing CSS

There are a lot of ways to import CSS. For this example, we have tested two rollup plugins, but you can use other plugins as well.

[rollup-plugin-postcss](https://github.com/egoist/rollup-plugin-postcss) supports a lot of CSS workflows.

<details>

<summary>View example</summary>

```js
/* eslint-disable */
const rollupPostcss = require('rollup-plugin-postcss');
const { fromRollup } = require('@web/dev-server-rollup');

const postcss = fromRollup(rollupPostcss);

module.exports = {
  // in a monorepo you need to adjust the rootdir of the web server
  // postcss injects a module which needs to be reachable from the browser
  // rootDir: '../..',
  plugins: [
    {
      name: 'serve-css',
      // you need to tell the web server you intend to serve .module.css files as
      // javascript modules
      resolveMimeType(context) {
        if (context.path.endsWith('.module.css')) {
          return 'js';
        }
      },
    },
    postcss({ include: ['src/**/*.css'], modules: true }),
  ],
};
```

</details>

If you're using `lit-element`, you can use [rollup-plugin-lit-css](https://www.npmjs.com/package/rollup-plugin-lit-css) to import CSS files as js modules.

<details>
<summary>View example</summary>

```js
/* eslint-disable */
const rollupLitcss = require('rollup-plugin-lit-css');
const { fromRollup } = require('@web/dev-server-rollup');

const litcss = fromRollup(rollupLitcss);

module.exports = {
  plugins: [
    {
      name: 'serve-css',
      // you need to tell the web server you intend to serve .css files as
      // javascript modules
      resolveMimeType(context) {
        if (context.path.endsWith('.css')) {
          return 'js';
        }
      },
    },
    litcss({ include: ['src/**/*.css'] }),
  ],
};
```

</details>

## Importing images

To import images from javascript, you can use [@rollup/plugin-url](https://www.npmjs.com/package/@rollup/plugin-url).

<details>

<summary>View example</summary>

Make sure not to use the `limit` option, as this causes the plugin to emit files in a way that `@web/dev-server-rollup` does not support.

```js
/* eslint-disable */
const rollupUrl = require('rollup-plugin-url');
const { fromRollup } = require('@web/dev-server-rollup');

const url = fromRollup(rollupUrl);

module.exports = {
  plugins: [
    {
      name: 'serve-assets',
      // you need to tell the web server which files you want to serve as JS module
      // in this example we're taking everything in the /assts directory
      resolveMimeType(context) {
        if (context.path.startsWith('/assets/')) {
          return 'js';
        }
      },
    },
    url({ include: ['assets/**/*.png'] }),
  ],
};
```

</details>
