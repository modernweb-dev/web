---
title: Esbuild
eleventyNavigation:
  key: Esbuild
  parent: Plugins
  order: 2
---

# Dev Server esbuild

Plugin for using [esbuild](https://github.com/evanw/esbuild) in web dev server and web test runner.

[esbuild](https://github.com/evanw/esbuild) is a blazing fast build tool, and can be used for example to transform TS and JSX to JS. It can also transform modern JS to older JS for older browsers.

## Usage

Install the package:

```
npm i --save-dev @web/dev-server-esbuild
```

Add the plugin in your configuration file:

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [esbuildPlugin({ ts: true })],
};
```

## Configuration

We expose the following options for esbuild:

```ts
type Target = 'auto' | 'esnext' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020';
// see esbuild documentation for what all these loaders do
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
  target?: Target;
  ts?: boolean;
  json?: boolean;
  jsx?: boolean;
  tsx?: boolean;
  jsxFactory?: string;
  jsxFragment?: string;
  loaders?: Record<string, Loader>;
  define?: { [key: string]: string };
}
```

## Target

The target option defines what version of javascript to compile down to. This is primarily to supporting older browsers.

The default target is `auto`. If this is configured we look at the browser's user agent. If you're on the latest version of a browser that adopts modern javascript syntax at a reasonable pace, we skip any compilation work.

The current set of browsers are Chrome, Firefox and Edge. Otherwise we compile to `es2017`. Because esbuild is so fast, this is not noticeable in most projects.

You can override this behavior by setting the `target` option yourself. If it is set to `esnext`, compilation is skipped entirely.

## Loaders

Loaders transform different kinds of files to JS. The `loaders` option takes a mapping from file extension to loader name:

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
// auto detect based on user agent
esbuildPlugin({ target: 'auto' });
// hardcoded
esbuildPlugin({ target: 'es2017' });
```

Transform TS, but don't transform any syntax:

```js
esbuildPlugin({ ts: true, target: 'esnext' });
```
