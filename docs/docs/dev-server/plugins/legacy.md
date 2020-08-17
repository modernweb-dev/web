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
  plugins: [legacyPlugin()],
};
```

## How it works

The plugin will automatically detect user agents which don't support modules. For those browsers it injects polyfills, transforms code to es5 and polyfills modules using [SystemJS](https://www.npmjs.com/package/systemjs).
