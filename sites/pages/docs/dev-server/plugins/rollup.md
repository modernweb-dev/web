# Dev Server >> Plugins >> Rollup ||4

Adapter for using rollup plugins in Web Dev Server and Web Test Runner.

Web Dev Server plugins and rollup plugins share a very similar API, making it possible to reuse rollup plugins inside Web Dev Server with an adapter.

Since the dev server doesn't run an actual rollup build, only rollup plugins that do single file transformations can be reused.

## Usage

Install the package:

```
npm i --save-dev @web/dev-server-rollup
```

Import the rollup plugin and the `fromRollup` function in your configuration file. Then, wrap the rollup plugin with the adapter function:

```js
import rollupReplace from '@rollup/plugin-replace';
import { fromRollup } from '@web/dev-server-rollup';

const replace = fromRollup(rollupReplace);

export default {
  plugins: [replace({ include: ['src/**/*.js'], __environment__: '"development"' })],
};
```

## Performance

Some rollup plugins do expensive operations. During development, this matters a lot more than during a production build. You are therefore required to always set the `include` and/or `exclude` options on rollup plugins.

## non-standard file types

The rollup build process assumes that any imported files are meant to be compiled to JS, Web Dev Server serves many different kinds of files to the browser. If you are transforming a non-standard filetype to JS, for example .json files, you need to instruct the server to handle it as a JS file:

```js
import json from '@rollup/plugin-json';
import { rollupAdapter } from '@web/dev-server-rollup';

export default {
  mimeTypes: {
    // serve all json files as js
    '**/*.json': 'js',
    // serve .module.css files as js
    '**/*.module.css': 'js',
  },
  plugins: [rollupAdapter(json())],
};
```

## Compatibility with rollup plugins

Since the dev server doesn't do any bundling, only the following lifecycle hooks from rollup are called:

- options
- buildStart
- resolveId
- load
- transform

Plugins that use other lifecycle hooks are mostly build optimizations and are not interesting during development.

The following rollup plugins have been tested to work correctly:

- [@rollup/plugin-alias](https://github.com/rollup/plugins/tree/master/packages/alias)
- [@rollup/plugin-inject](https://github.com/rollup/plugins/tree/master/packages/inject)
- [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs)
- [@rollup/plugin-dsv](https://github.com/rollup/plugins/tree/master/packages/dsv)
- [@rollup/plugin-image](https://github.com/rollup/plugins/tree/master/packages/image)
- [@rollup/plugin-json](https://github.com/rollup/plugins/tree/master/packages/json)
- [@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve)
- [@rollup/plugin-replace](https://github.com/rollup/plugins/tree/master/packages/replace)
- [@rollup/plugin-sucrase](https://github.com/rollup/plugins/tree/master/packages/sucrase)
- [rollup-plugin-typescript-paths](https://github.com/simonhaenisch/rollup-plugin-typescript-paths)

The following rollup plugins don't work correctly at the moment:

- [@rollup/plugin-typescript](https://github.com/rollup/plugins/tree/master/packages/typescript). For compiling typescript we recommend [@web/dev-server-esbuild](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-esbuild)

## Bundling

We export an experimental plugin for on the fly bundling with rollup. This is useful when you rely on some specific rollup logic, or when running tests remotely and the performance benefits outweigh the bundling times. Debugging a bundled application is harder.

To use the plugin, add `rollupBundlePlugin` to your config and set your test files as input.

```js
import { rollupBundlePlugin } from '@web/dev-server-rollup';

export default {
  plugins: [
    rollupBundlePlugin({
      rollupConfig: {
        input: ['test/foo.test.js', 'test/bar.test.js'],
      },
    }),
  ],
};
```
