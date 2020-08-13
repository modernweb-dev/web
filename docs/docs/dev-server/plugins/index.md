---
title: Dev Server Plugins
layout: with-index.njk
eleventyNavigation:
  key: Plugins
  parent: Dev Server
  order: 2
---

Plugins are objects with lifecycle hooks called by the dev server or test runner as it serves files to the browser. They can be used to serve virtual files, transform files, or resolve module imports.

Plugins share a similar API to [rollup](https://github.com/rollup/rollup) plugins. In fact, you can reuse rollup plugins in the dev server. See the [Rollup section](./rollup.md) for that, and the [examples section](./examples.md) for practical use cases.

A plugin is just an object that you add to the `plugins` array in your configuration file. You can add an object directly, or create one from a function somewhere:

In your `web-dev-server.config.js` or `web-test-runner.config.js`:

```js
import awesomePlugin from 'awesome-plugin';

export default {
  plugins: [
    // use a plugin
    awesomePlugin({ someOption: 'someProperty' }),
    // create an inline plugin
    {
      name: 'my-plugin',
      transform(context) {
        if (context.response.is('html')) {
          return { body: context.body.replace(/<base href=".*">/, '<base href="/foo/">') };
        }
      },
    },
  ],
};
```
