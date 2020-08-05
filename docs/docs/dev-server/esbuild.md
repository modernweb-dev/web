---
title: Dev Server esbuild
eleventyNavigation:
  key: esbuild
  parent: Dev Server
  order: 10
---

[esbuild](https://github.com/evanw/esbuild) plugin for [@web/test-runner-server](https://www.npmjs.com/package/@web/test-runner-server) and [es-dev-server](https://www.npmjs.com/package/es-dev-server).

esbuild is a blazing fast build tool, and can be used to transform TS and JSX to JS. It can also transform modern JS to older JS for older browsers.

## Usage

Install the package:

```bash
npm i -D @web/dev-server-esbuild
```

Create a configuration file:

```js
const { esbuildPlugin } = require('@web/dev-server-esbuild');

module.exports = {
  plugins: [esbuildPlugin({ ts: true })],
};
```

## Configuration

We expose the following options for esbuild:

```ts
type Target = 'auto' | 'esnext' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020';
type Loader = 'js' | 'jsx' | 'ts' | 'tsx';

interface EsbuildPluginArgs {
  target?: Target;
  js?: boolean;
  jsx?: boolean;
  ts?: boolean;
  tsx?: boolean;
  jsxFactory?: string;
  jsxFragment?: string;
  loaders: Record<string, Loader>;
  define?: { [key: string]: string };
}
```

## Target

The target option defines what version of javascript to compile down to. This is primary for supporting older browsers.

The default target is `auto`. If this is configured we look at the browser's user agent. If you're on the latest version of a browser that adopts modern javascript syntax at a reasonable pace, we skip any compilation work.

The current set of browsers are Chrome, Firefox and Edge. Otherwise we compile to `es2017`. Because esbuild is so fast, this is not noticeable.

You can override this behavior by setting the `target` option yourself. If it is set to `esnext`, we skip any compilation for js files.

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
esbuildPlugin({ loaders: { js: 'jsx' }, jsxFactory: 'h', jsxFragment: 'Fragment' });
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
esbuildPlugin({ js: true, target: 'es2017' });
```

Transform TS, but don't transform any JS:

```js
esbuildPlugin({ ts: true, target: 'exnest' });
```
