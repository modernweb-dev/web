# Dev Server esbuild

> This package is still experimental. Let us know if you find any issues!

[esbuild](https://github.com/evanw/esbuild) plugin for [@web/test-runner-server](https://www.npmjs.com/package/@web/test-runner-server) and [es-dev-server](https://www.npmjs.com/package/es-dev-server).

esbuild is a blazing fast build tool, and can be used to transform TS and JSX to JS. It can also transform modern JS to older JS for older browsers.

## Usage

Install the package:

```bash
npm i -D @web/dev-server-esbuild
```

### In es-dev-server

Create a `es-dev-server.config.js` file:

```js
const esBuildPlugin = require('@web/dev-server-esbuild');

module.exports = {
  plugins: [esbuildPlugin({ ts: true })],
};
```

### In @web/test-runner

Create a `web-test-runner.config.js` file:

```js
const esBuildPlugin = require('@web/dev-server-esbuild');

module.exports = {
  devServer: {
    plugins: [],
  },
};
```

## Confiugration

We expose the following options for esbuild:

```ts
interface EsBuildPluginArgs {
  target?: Target;
  js?: boolean;
  jsx?: boolean;
  ts?: boolean;
  tsx?: boolean;
  jsxFactory?: string;
  jsxFragment?: string;
  define?: { [key: string]: string };
}
```

Some examples:

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

**TSX**

Transform all .tsx files to javascript:

```js
esbuildPlugin({ tsx: true });
esbuildPlugin({ tsx: true, jsxFactory: 'h', jsxFragment: 'Fragment' });
```

**JS**

Transform JS to older versions of JS:

```js
esbuildPlugin({ js: true, target: 'es2015' });
```
