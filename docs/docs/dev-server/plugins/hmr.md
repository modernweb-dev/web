# Dev Server >> Plugins >> Hot Module Replacement ||7

Plugin for introducing HMR (hot module replacement) support.

Modules can be written to consume the provided HMR API at development
time, allowing for them to update without reloading the page.

## Implementations

> This plugin only implements the basics of HMR, you will likely not use it directly but instead through one of the implementations:

- [@open-wc/dev-server-hmr](https://open-wc.org/docs/development/hot-module-replacement/) for web components
- [@prefresh/web-dev-server](https://github.com/JoviDeCroock/prefresh/) for preact

## Installation

Install the package:

```
npm i --save-dev @web/dev-server-hmr
```

Add the plugin to your `web-dev-server-config.mjs` or `web-test-runner.config.js`:

```ts
import { hmrPlugin } from '@web/dev-server-hmr';

export default {
  plugins: [hmrPlugin()],
};
```

## Basic usage

When the plugin is loaded, any HMR-compatible module will have the HMR API
made available to it via `import.meta.hot`.

By default, it will effectively do nothing until you have written code
which consumes this API.

For example, take the following module:

```ts
/** Adds two numbers */
export let add = (a, b) => {
  return a + b;
};
```

In its current state, it will _not_ be HMR-compatible as it does not reference
the HMR API. This means if our `add` module changes, the HMR plugin will
trigger a full page reload.

To make it compatible, we must use the HMR API via `import.meta.hot`:

```ts
/** Adds two numbers */
export let add = (a, b) => {
  return a + b;
};

if (import.meta.hot) {
  import.meta.hot.accept(module => {
    add = module.add;
  });
}
```

The plugin will detect that your module uses the HMR API and will make the
`import.meta.hot` object available.

Do note that in our example we wrapped this in an `if` statement. The reason
for this is to account for if the plugin has not been loaded.

## esm-hmr spec

This plugin implements the [esm-hmr spec](https://github.com/snowpackjs/esm-hmr).

## Note about production

In production it is highly recommended you remove any of these HMR related
blocks of code as they will effectively be dead code.

## Use with libraries/frameworks

This plugin exists primarily to serve as a base to other
framework/ecosystem-specific implementations of HMR.

It can be consumed directly as-is, but in future should usually be
used via another higher level plugin layered on top of this.

## API

### `import.meta.hot.accept()`

Calling `accept` without a callback will notify the plugin that your module
accepts updates, but will not deal with the updates.

This is only really useful if your module is one which has side-effects
and does not need mutating on update (i.e. has no exports).

Example:

```ts
// will be set each time the module updates as a side-effect
window.someGlobal = 303;
import.meta.hot.accept();
```

### `import.meta.hot.accept((module) => { ... })`

If you pass a callback to `accept`, it will be passed the updated module
any time an update occurs.

At this point, you should usually update any exports to be those on the
new module.

Example:

```ts
export let foo = 808;
import.meta.hot.accept(module => {
  foo = module.foo;
});
```

### `import.meta.hot.acceptDeps(['./dep1.js', './dep2.js'], ([dep1, dep2]) => { ... })`

If you specify a list of dependencies as well as a callback, your callback
will be provided with the up-to-date version of each of those modules.

This can be useful if your updates require access to dependencies of the
current module.

Example:

```ts
import { add } from './add.js';

export let foo = add(10, 10);

import.meta.hot.acceptDeps(['./add.js'], deps => {
  foo = deps[0].add(10, 10);
});
```

### `import.meta.hot.invalidate()`

Immediately invalidates the current module which will then lead to reloading
the page.

Example:

```ts
export let foo = 303;

import.meta.hot.accept(module => {
  if (!module.foo) {
    import.meta.hot.invalidate();
  } else {
    foo = module.foo;
  }
});
```

### `import.meta.hot.decline()`

Notifies the server that you do not support updates, meaning any updates
will result in a full page reload.

This may be useful when your module makes global changes (side effects) which
cannot be re-done.

Example:

```ts
doSomethingGlobal();

import.meta.hot.decline();
```

### `import.meta.dispose(() => { ... })`

Specifies a callback to be called when the current module is disposed of,
before the new module is loaded and passed to `accept()`.

Example:

```ts
export let foo = new Server();

foo.start();

import.meta.hot.accept(module => {
  foo = module.foo;
  foo.start();
});

import.meta.dispose(() => {
  foo.stop();
});
```
