# Dev Server >> Plugins >> Import Maps ||5

Plugin for resolving imports using [Import maps](https://github.com/WICG/import-maps).

Import Maps can be used to resolve imports in your code as an alternative to the `--node-resolve` flag, or to mock modules.

## Import Maps

> Description from the original proposal readme

This proposal allows control over what URLs get fetched by JavaScript import statements and import() expressions. This allows "bare import specifiers", such as import moment from "moment", to work.

The mechanism for doing this is via an import map which can be used to control the resolution of module specifiers generally. As an introductory example, consider the code

```js
import moment from 'moment';
import { partition } from 'lodash';
```

Today, this throws, as such bare specifiers are explicitly reserved. By supplying the browser with the following import map

```html
<script type="importmap">
  {
    "imports": {
      "moment": "/node_modules/moment/src/moment.js",
      "lodash": "/node_modules/lodash-es/lodash.js"
    }
  }
</script>
```

the above would act as if you had written

```js
import moment from '/node_modules/moment/src/moment.js';
import { partition } from '/node_modules/lodash-es/lodash.js';
```

## Installation

Install the package:

```
npm i --save-dev @web/dev-server-import-maps
```

Add the plugin to your `web-dev-server.config.mjs` or `web-test-runner.config.js`:

```js
import { importMapsPlugin } from '@web/dev-server-import-maps';

export default {
  plugins: [importMapsPlugin()],
};
```

## Basic usage

When the plugin is installed any import maps found in HTML files are used to resolve imports in modules imported by the HTML file:

```html
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "chai": "/node_modules/@esm-bundle/chai/chai.js",
          "./app.js": "./mocked-app.js"
        }
      }
    </script>
  </head>

  <body>
    <script type="module">
      // mapped to /node_modules/@esm-bundle/chai/chai.js
      import chai from 'chai';
      // mapped to ./mocked-app.js
      import app from './app.js';
      // any imports inside ./foo.js will be mapped as well
      import './foo.js';
    </script>
  </body>
</html>
```

In the test runner, you can author tests in HTML to use import maps in your test.

## Import map options

Check the [official proposal](https://github.com/WICG/import-maps) for all possible options.

## Injecting import maps

The import map plugin can also inject import maps to HTML files using the `inject` option.

```js
import { importMapsPlugin } from '@web/dev-server-import-maps';

export default {
  plugins: [
    importMapsPlugin({
      inject: {
        importMap: {
          imports: { foo: './bar.js' },
        },
      },
    }),
  ],
};
```

### Including or excluding file

You can control which html files the import map is injected into using the `include` option. This is a glob matched against the browser path:

```js
import { importMapsPlugin } from '@web/dev-server-import-maps';

export default {
  plugins: [
    importMapsPlugin({
      inject: {
        include: '/pages/*.html',
        importMap: {
          imports: { foo: './bar.js' },
        },
      },
    }),
  ],
};
```

The `exclude` option can be used to exclude files:

```js
import { importMapsPlugin } from '@web/dev-server-import-maps';

export default {
  plugins: [
    importMapsPlugin({
      inject: {
        exclude: '**/*.fragment.html',
        importMap: {
          imports: { foo: './bar.js' },
        },
      },
    }),
  ],
};
```

### Multiple Import Maps

The `inject` option can also take an array with multiple import maps:

```js
import { importMapsPlugin } from '@web/dev-server-import-maps';

export default {
  plugins: [
    importMapsPlugin({
      inject: [
        {
          include: '/pages/a.html',
          importMap: {
            imports: { foo: './bar1.js' },
          },
        },
        {
          include: '/pages/b.html',
          importMap: {
            imports: { foo: './bar2.js' },
          },
        },
        {
          include: '/test/**/*.test.html',
          importMap: {
            imports: { foo: './bar3.js' },
          },
        },
      ],
    }),
  ],
};
```
