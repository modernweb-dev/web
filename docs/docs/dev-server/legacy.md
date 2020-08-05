---
title: Dev Server Legacy
eleventyNavigation:
  key: Legacy
  parent: Dev Server
  order: 10
---

> This package is still experimental

Use the dev server or test runner on legacy browsers, for example Internet Explorer 11 which does not support modules.

## Usage

```bash
npm i --save-dev @web/dev-server-legacy
```

Add the plugin to your config:

```js
const { legacyPlugin } = require('@web/dev-server-legacy');

module.exports = {
  plugins: [legacyPlugin()],
};
```

The plugin will automatically detect user agents which don't support modules. For those browsers it injects polyfills, transforms to es5 and SystemJS.
