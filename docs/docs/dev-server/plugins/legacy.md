---
title: Legacy
eleventyNavigation:
  key: Legacy
  parent: Plugins
  order: 5
---

Plugin for using the dev server or test runner on legacy browsers, for example on Internet Explorer 11 which does not support modules.

## Usage

```
npm i --save-dev @web/dev-server-legacy
```

Add the plugin to your config:

```js
import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  plugins: [
    // make sure this plugin is always last
    legacyPlugin(),
  ],
};
```

> Make sure the legacy plugin is always the last one to transform your code. Otherwise it will compile away modules before other tools can process them.

## How it works

The plugin will automatically detect user agents which don't support modules. For those browsers it injects polyfills, transforms code to es5 and polyfills modules using [SystemJS](https://www.npmjs.com/package/systemjs).
