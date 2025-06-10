# Dev Server >> Plugins >> Esbuild ||3

Plugin for using [esbuild](https://github.com/evanw/esbuild) in Web Dev Server and Web Test Runner. [esbuild](https://github.com/evanw/esbuild) is a blazing fast build tool.

It can be used for fast single-file transforms, for example to transform TS, JSX, TSX and JSON to JS, or to transform modern JS to an older version of JS for older browsers.

## Usage

Install the package:

```
npm i --save-dev @web/dev-server-esbuild
```

Add the plugin in your configuration file:

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [esbuildPlugin({ ts: true, target: 'auto' })],
};
```

## Single file transforms

Note that the esbuild plugin uses the [esbuild single file transform API](https://esbuild.github.io/api/#transform-api), transforming files as they are requested by the browser. We don't use esbuild's bundling API, so some features like module transformation are not available.

## Configuration

We expose the following options for esbuild. Most of them are a mirror of the esbuild API, check the esbuild docs to learn more about them.

```ts
type Loader =
  | 'js'
  | 'jsx'
  | 'ts'
  | 'tsx'
  | 'json'
  | 'text'
  | 'base64'
  | 'file'
  | 'dataurl'
  | 'binary';

interface EsbuildPluginArgs {
  target?: string | string[];
  js?: boolean;
  ts?: boolean;
  json?: boolean;
  jsx?: boolean;
  tsx?: boolean;
  jsxFactory?: string;
  jsxFragment?: string;
  loaders?: Record<string, Loader>;
  define?: { [key: string]: string };
  tsconfig?: string;
}
```

## Target

The target option defines what version of javascript to compile down to. This is primarily to support older browsers.

### Auto target

We recommended setting target to `auto`, this is the default when you turn on a loader but needs to be enabled explicitly for JS transforms.

When target is `auto`, we look at the browser's user agent. If you're on the latest version of a browser that adopts modern javascript syntax at a reasonable pace, we skip any compilation work.

The current set of browsers are Chrome, Firefox and Edge. Otherwise we transform the code to a compatible version of javascript specific to that browser. This transformation is very fast.

### Always auto

The `auto-always` option looks at the user agent, but doesn't skip the latest versions of modern browsers. It will always compile to a compatible target for that browser. Use this when you're using features not yet supported in the latest version of one of the modern browsers.

### Browser and language target

The target option can be set to one or more browser or language target versions, for example `chrome80` or `es2020`. The property can be an array, so you can set multiple browser targets. While the auto target options are specific to this plugin, the browser and language target come directly from esbuild. [Check the docs](https://github.com/evanw/esbuild) for more information.

### No target

If `target` is set to `esnext`, transformation is skipped entirely.

## Loaders

Loaders transform different kinds of file formats to JS. The `loaders` option takes a mapping from file extension to loader name:

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [esbuildPlugin({ loaders: { '.ts': 'ts', '.data': 'json' } })],
};
```

For a few common loaders, there are boolean options which act like shorthand for setting the file extension and loader.

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [
    esbuildPlugin({
      // shorthand for loaders: { '.ts': 'ts' }
      ts: true,
      // shorthand for loaders: { '.json': 'json' }
      json: true,
      // shorthand for loaders: { '.jsx': 'jsx' }
      jsx: true,
      // shorthand for loaders: { '.tsx': 'tsx' }
      tsx: true,
    }),
  ],
};
```

## Examples

**Typescript:**

Transform all .ts files to javascript:

```js
esbuildPlugin({ ts: true });
```

Transform all .ts files to javascript using settings from tsconfig.json. (The `tsconfig.json` file is not read by default.)

```js
import { fileURLToPath } from 'url';

esbuildPlugin({
  ts: true,
  tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
});
```

**JSX:**

Transform all .jsx files to javascript:

```js
esbuildPlugin({ jsx: true });
```

By default, `jsx` gets transformed to React.createElement calls. You can change this to the JSX style you are using.

For example when importing from preact like this:

```js
import { h, Fragment } from 'preact';
```

```js
esbuildPlugin({ jsx: true, jsxFactory: 'h', jsxFragment: 'Fragment' });
```

If you want to use jsx inside .js files you need to set up a custom loader:

```ts
esbuildPlugin({ loaders: { ['.js']: 'jsx' }, jsxFactory: 'h', jsxFragment: 'Fragment' });
```

**TSX**

Transform all .tsx files to javascript:

```js
esbuildPlugin({ tsx: true });
esbuildPlugin({ tsx: true, jsxFactory: 'h', jsxFragment: 'Fragment' });
```

**JS**

Transform all JS to older versions of JS:

```js
esbuildPlugin({ target: 'auto' });
```

Transform TS, but don't transform any syntax:

```js
esbuildPlugin({ ts: true, target: 'esnext' });
```
