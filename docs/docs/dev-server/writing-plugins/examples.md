# Dev Server >> Writing Plugins >> Examples ||2

Common examples using plugins.

Generally speaking, the two most important plugins are [esbuild](../plugins/esbuild.md) and [rollup](../plugins/rollup.md). Esbuild can be used for fast transformations, while rollup has a rich plugin ecosystem we can use.

Some of the examples require you to Write Your Own plugin. The examples are straight forward, but you can check the [writing plugins section](./overview.md) for a more detailed explanation.

## Typescript

To use typescript with the dev server, you have two main options.

### tsc

You can use `tsc`, the official typescript compiler, to transform TS to JS. This is the most stable option as this is the official tool, but it is slower and you need to run it before running tests or dev server.

Check the [official typescript docs](https://www.typescriptlang.org/) to set up TSC, and then run the test runner on the generated JS files.

### esbuild

The dev server can also transform TS on the fly using `esbuild`. It is the fastest approach, introducing only a few milliseconds overhead. Check the [esbuild plugin docs](../plugins/esbuild.md) to learn more about how to set it up.

## Other module formats

The browser only supports standard es modules, using `import` and `export` statements. Check out [es modules docs](../../../guides/going-buildless/es-modules.md) to learn more about using es modules and supporting other module formats such as CommonJS and UMD.

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
import fs from 'fs';
import path from 'path';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

export default {
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
import rollupReplace from '@rollup/plugin-replace';
import { fromRollup } from '@web/dev-server-rollup';

const replace = fromRollup(rollupReplace);

export default {
  plugins: [replace({ include: ['src/**/*.js'], __environment__: '"development"' })],
};
```

</details>

## Mocking or stubbing modules

Es modules are immutable, you cannot mock or stub them at runtime in the browser. You can however serve a mock or stub version from the webserver. In the test runner, this affects all tests, you cannot do this per test file.

<details>
<summary>View example</summary>

```js
export default {
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
import rollupBabel from '@rollup/plugin-babel';
import { fromRollup } from '@web/dev-server-rollup';

const babel = fromRollup(rollupBabel);

export default {
  plugins: [babel({ include: ['src/**/*.js'], plugins: ['babel-plugin-foo'] })],
};
```

</details>

## JSX and TSX

You can use [esbuild](../plugins/esbuild.md) to handle transforming JSX and TSX on the fly.

## Importing JSON

To import JSON files you can use [@rollup/plugin-json](https://www.npmjs.com/package/@rollup/plugin-json)

<details>
<summary>View example</summary>

In addition to installing the rollup plugin, we need to tell the dev server to serve json files as js modules:

```js
import rollupJson from '@rollup/plugin-json';
import { fromRollup } from '@web/dev-server-rollup';

const json = fromRollup(rollupJson);

export default {
  // tell the server to serve json files as js
  mimeTypes: {
    '**/*.json': 'js',
  },
  plugins: [json({})],
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
import rollupPostcss from 'rollup-plugin-postcss';
import { fromRollup } from '@web/dev-server-rollup';

const postcss = fromRollup(rollupPostcss);

export default {
  // in a monorepo you need to adjust the rootdir of the web server
  // postcss injects a module which needs to be reachable from the browser
  // rootDir: '../..',

  // tell the server to serve css files as js
  mimeTypes: {
    '**/*.css': 'js',
  },
  plugins: [postcss({ include: ['src/**/*.css'], modules: true })],
};
```

</details>

You can use [rollup-plugin-lit-css](https://www.npmjs.com/package/rollup-plugin-lit-css) to import CSS files as JavaScript modules exporting tagged template literals.

<details>
<summary>View example</summary>

```js
/* eslint-disable */
import rollupLitcss from 'rollup-plugin-lit-css';
import { fromRollup } from '@web/dev-server-rollup';

const litcss = fromRollup(rollupLitcss);

export default {
  // tell the server to serve css files as js
  mimeTypes: {
    '**/*.css': 'js',
  },
  plugins: [litcss({ include: ['src/**/*.css'] })],
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
import rollupUrl from 'rollup-plugin-url';
import { fromRollup } from '@web/dev-server-rollup';

const url = fromRollup(rollupUrl);

export default {
  // tell the server to serve your assets files as js
  mimeTypes: {
    './assets/**/*': 'js',
  },
  plugins: [url({ include: ['assets/**/*.png'] })],
};
```

</details>
