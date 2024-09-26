# Dev Server >> Using plugins ||40

By default, the dev server serves your code to the browser as is without modifications. There is a rich plugin API that can be used to modify code before it is served to the browser. Using a small adapter, the dev server supports most rollup plugins as well.

## Rollup replace plugin

Packages published on NPM often use `process.env.NODE_ENV` to detect code is running in production or development mode. These variables are not defined in the browser and will crash.

In this example, we will use [@rollup/plugin-replace](https://github.com/rollup/plugins/tree/master/packages/replace) to set up some environment variables.

### Configuration

Install the required dependencies:

```
npm install --save-dev @web/dev-server @web/dev-server-rollup @rollup/plugin-replace
```

Create a `web-dev-server.config.mjs`. The `fromRollup` function will convert a rollup plugin to a compatible plugin for Web Dev Server.

Note that for speed it's important to define explicitly which files to include.

```js
import { fromRollup } from '@web/dev-server-rollup';
import rollupReplace from '@rollup/plugin-replace';

const replace = fromRollup(rollupReplace);

export default {
  plugins: [
    replace({
      // setting "include" is important for performance
      include: ['src/logger.js'],
      'process.env.NODE_ENV': '"development"',
    }),
  ],
};
```

### Add files

First, add a file at `src/logger.js` which will use the environment variable:

```js
export function logDebug(msg) {
  if (process.env.NODE_ENV === 'development') {
    console.log(msg);
  }
}
```

And add a `demo/index.html` file which will use this function:

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">
      import { logDebug } from '../src/logger.js';

      logDebug('Hello world debug');
    </script>
  </body>
</html>
```

### Starting the server

Finally, we can run this example:

```
npx web-dev-server --open /demo/
```

## Commonjs

If you are getting errors such as `X does not export Y`, `X does not have a default export`, or `require is not defined` you might be running into a package published on NPM as a common js or UMD module. Read our [es modules guide](../going-buildless/es-modules.md) to learn more about different module formats

You can use `@rollup/plugin-commonjs` to transform these modules into an es module. Note that not all commonjs modules can be transformed in this way, for example, the browser does not support node libraries like `fs` and `path`.

Note that the commonjs plugin isn't very fast, and should be limited to run only on commonjs code.

Example config:

```js
import { fromRollup } from '@web/dev-server-rollup';
import rollupCommonjs from '@rollup/plugin-commonjs';

const commonjs = fromRollup(rollupCommonjs);

export default {
  plugins: [
    commonjs({
      include: [
        // the commonjs plugin is slow, list the required packages explicitly:
        '**/node_modules/<package-a>/**/*',
        '**/node_modules/<package-b>/**/*',
      ],
    }),
  ],
};
```

## Babel

When doing buildless development you want compilers to be as fast as possible. That's why we recommend esbuild for common transformations like TS, JSX, and modern JS. [See our guide](./typescript-and-jsx.md) to learn more about how to set this up.

If you need to use babel because of a specific plugin, you can use `@rollup/plugin-babel`. In this example we use babel with the JSX plugin for preact:

```js
import { fromRollup } from '@web/dev-server-rollup';
import rollupBabel from '@rollup/plugin-babel';

// note that you need to use `.default` for babel
const babel = fromRollup(rollupBabel.default);

export default {
  // mimeTypes tells the dev server to treat .jsx files as .js
  mimeTypes: {
    '**/*.jsx': 'js',
  },
  plugins: [
    babel({
      include: ['**/*.jsx'],
      babelHelpers: 'bundled',
      plugins: [['@babel/plugin-transform-react-jsx', { pragma: 'h' }]],
    }),
  ],
};
```

## Plugins

Official dev server plugins:

- [@web/dev-server-esbuild](https://modern-web.dev/docs/dev-server/plugins/esbuild/) for JSX, TS and JS transformation
- [@web/dev-server-rollup](https://modern-web.dev/docs/dev-server/plugins/rollup/) for reusing rollup plugins
- [@web/dev-server-import-maps](https://modern-web.dev/docs/dev-server/plugins/import-maps/) for injecting or polyfilling import maps
- [@web/dev-server-legacy](https://modern-web.dev/docs/dev-server/plugins/legacy/) for usage on legacy browsers
- [@web/dev-server-hmr](https://modern-web.dev/docs/dev-server/plugins/hmr/) for hot module replacement with es modules
- [@web/dev-server-storybook](https://modern-web.dev/docs/dev-server/plugins/storybook/) for using storybook with Web Dev Server

Useful rollup plugins:

- [@rollup/plugin-babel](https://github.com/rollup/plugins/tree/master/packages/babel) for using babel
- [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) for transforming commonjs
- [@rollup/plugin-replace](https://github.com/rollup/plugins/tree/master/packages/replace) for replacing constants
- [@rollup/plugin-alias](https://github.com/rollup/plugins/tree/master/packages/alias) for aliasing modules

See the [full list of rollup plugins](https://github.com/rollup/awesome) for more.

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/dev-server).
See the [documentation of @web/dev-server](../../docs/dev-server/overview.md).
