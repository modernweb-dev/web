# Dev Server >> Plugins >> Legacy ||6

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

## Configuration

The legacy plugins injects common polyfills on the page using [polyfills-loader](https://github.com/open-wc/open-wc/tree/master/packages/polyfills-loader). It's possible to turn off this behavior:

```js
import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  plugins: [
    // make sure this plugin is always last
    legacyPlugin({ polyfills: false }),
  ],
};
```

You can also turn off only some polyfills, or add custom polyfills:

```js
import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  plugins: [
    // make sure this plugin is always last
    legacyPlugin({
      // these are the default values
      coreJs: true,
      regeneratorRuntime: 'always',
      fetch: true,
      abortController: true,
      webcomponents: true,
      intersectionObserver: false,
      resizeObserver: false,

      // you can also inject custom polyfills:
      custom: [
        {
          // the name, must be unique
          name: 'my-feature-polyfill',
          // path to the polyfill file
          path: require.resolve('my-feature-polyfill'),
          // a test that determines when this polyfill should be loaded
          // often this is done by checking whether some property of a
          // feature exists in the window
          test: "!('myFeature' in window)",
          // whether your polyfill should be loaded as an es module
          module: false,
          // some polyfills need to be explicitly initialized
          // this can be done with the initializer
          initializer: 'window.myFeaturePolyfills.initialize()',
        },
      ],
    }),
  ],
};
```
