# Polyfills loader

The polyfills loader makes it easy to manage loading polyfills and/or serving different versions of your application based on browser support. It generates a script that loads the necessary polyfills and the appropriate version of the application through on runtime feature detection.

A simplified version of the loader:

```js
// detect support for various browser features, load a polyfill if necessary
var polyfills = [];
if (!('fetch' in window)) {
  polyfills.push(loadScript('./polyfills/fetch.js'));
}

if (!('IntersectionObserver' in window)) {
  polyfills.push(loadScript('./polyfills/intersection-observer.js'));
}

// wait for polyfills to load
Promise.all(polyfills).then(function () {
  if (!('noModule' in HTMLScriptElement.prototype)) {
    // browser doesn't support es modules, load a SystemJS build with es5
    System.import('./legacy/app.js');
  } else {
    // browser supports modules, import a modern build
    import('./app.js');
  }
});
```

## Performance

The primary reason for this project is to make it easier to build performant web apps. The web ecosystem is evolving fast, it's easy to end up with many unnecessary polyfills in your application because all supported browsers already implement the feature you are using.

By loading polyfills conditionally, you make sure you only load what's necessary and you don't need to include them in your main bundle. Polyfills are hashed based on content, so they can be cached indefinitely by a web server or service worker.

Serving different versions of your application means you don't need to serve the lowest common denominator to all of your users. This is often achieved used `<script type="module">` and `<script nomodule>`. The polyfills loader uses a variation of this, where the feature detection happens in javascript because we need to ensure polyfills are loaded before any of your application code is run.

## Preloading

Browser optimize loading webpages by scanning ahead for script tags and fetching them right away. Because the polyfills loader moves the loading of scripts into javascript, we lose out on this optimization. For the polyfills, this is intentional, because we don't want to load them all the time and since they will be cached this optimization does not do much anyway.

For your application code, we recommend using `preload` (or `modulepreload` when it is widely supported) links to ensure your application's modern build is fetched from the start.

```html
<head>
  <link rel="preload" href="./app.js" />
  <!-- for module scripts, add a corrs attribute -->
  <link rel="preload" href="./app.js" crossorigin="anonymous" />
</head>
```

## Configuration

You will most likely use the polyfills loader as part of another tool, but it can be used directly as well.

### Example configuration

A typical web app which loads as modules on modern browsers, and system js on older browsers:

```js
const config = {
  modern: {
    files: [{ type: 'module', path: 'app.js' }],
  },
  legacy: [
    {
      test: "!('noModule' in HTMLScriptElement.prototype)",
      files: [{ type: 'systemjs', path: 'app.js' }],
    },
  ],
  polyfills: {
    hash: true,
    coreJs: true,
    fetch: true,
    abortController: true,
    regeneratorRuntime: true,
    dynamicImport: true,
    webcomponents: true,
    intersectionObserver: true,
    resizeObserver: true,
  },
  minify: true,
};
```

### Configuration options

#### modern

The files to load on modern browsers. Loaded if no legacy entry points match for the current browser, or if none are configured. Each file specifies how it should be loaded.

<details>
 <summary>View example</summary>

```js
const config = {
  modern: {
    files: [
      // filetype can be: 'module', 'script' or 'systemjs
      { type: 'script', path: 'file-a.js' },
      { type: 'module', path: 'file-b.js' },
    ],
  },
};
```

</details>

#### legacy

Sets of files to load on legacy browsers, and the runtime feature detection to execute to determine whether it should be loaded.

<details>
 <summary>View example</summary>

```js
const config = {
  legacy: [
    {
      test: "!('noModule' in HTMLScriptElement.prototype)",
      files: [
        // filetype can be: 'module', 'script' or 'systemjs
        { type: 'systemjs', path: 'file-a.js' },
        { type: 'systemjs', path: 'file-b.js' },
      ],
    },
    {
      test: "!('foo' in window)",
      files: [
        // filetype can be: 'module', 'script' or 'systemjs
        { type: 'script', path: 'file-a.js' },
        { type: 'script', path: 'file-b.js' },
      ],
    },
  ],
};
```

</details>

#### polyfills

The polyfills config controls which polyills are injected onto the page. These are the possible polyfills:

- [coreJs](https://github.com/zloirock/core-js)
- [regeneratorRuntime](https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime)
- [webcomponents](https://github.com/webcomponents/webcomponentsjs)
- [fetch](https://github.com/github/fetch)
- [abortController](https://github.com/github/fetch)
- [intersectionObserver](https://github.com/mo/abortcontroller-polyfill)
- [resizeObserver](https://github.com/que-etc/resize-observer-polyfill)
- [systemjs](https://github.com/systemjs/systemjs) (also injected when one of the files is systemjs)
- [dynamicImport](https://github.com/GoogleChromeLabs/dynamic-import-polyfill)
- [esModuleShims](https://github.com/guybedford/es-module-shims)
- [shadyCssCustomStyle](https://github.com/webcomponents/polyfills/blob/master/packages/shadycss/custom-style-interface.html) (you must also include webcomponents)

They can be turned on using booleans. When using the polyfills loader directly, these are default false. Other tools may turn on different defaults.

<details>
<summary>View example</summary>

```js
const config = {
  polyfills: {
    coreJs: true,
    fetch: true,
    webcomponents: true,
  },
};
```

</details>

#### Shady css custom style

In order to define css variables outside of a web component in IE11, you need to wrap the `<style>` tag inside of a `<shady-css-scoped>` tag. This tag is provided by the shady-css-scoped-element package, and will be included if you use both the webcomponents and shadyCssCustomStyle polyfills.

<details>
<summary>View example</summary>

index.html

```html
<shady-css-scoped>
  <style>
    html {
      --my-button-color: pink;
    }
  </style>
</shady-css-scoped>
```

config.js

```js
const config = {
  polyfills: {
    webcomponents: true,
    shadyCssCustomStyle: true,
  },
};
```

</details>

#### hashing

With the `hash` option, polyfill filenames can be hashed based on their content, this allows them to be cached indefinitely.

<details>
<summary>View example</summary>

```js
const config = {
  polyfills: {
    hash: true,
    coreJs: true,
    fetch: true,
    webcomponents: true,
  },
};
```

</details>

#### custom polyfills

If you need a polyfill that isn't available in the default list, you can add a custom polyfill. These consist of at least a unique name, a path where to find the polyfill and a bit of javascript executed at runtime to test whether the polyfill should be loaded.

<details>
<summary>View example</summary>

```js
const config = {
  polyfills: {
    hash: true,
    fetch: true,
    custom: [
      {
        // the name, must be unique
        name: 'my-feature-polyfill',
        // path to the polyfill fle
        path: require.resolve('my-feature-polyfill'),
        // a test that determines when this polyfill should be loaded
        // often this is done by checking whether some property of a
        // feature exists in the window
        test: "!('myFeature' in window)",

        // optional advanced features:

        // if your polyfill is not yet minified, it can be minified by
        // the polyfills loaded if you set it to true
        minify: true,
        // whether your polyfill should be loaded as an es module
        module: false,
        // some polyfills need to be explicitly initialized
        // this can be done with the initializer
        initializer: 'window.myFeaturePolyfills.initialize()',
      },
    ],
  },
};
```

</details>

#### exclude

The polyfills loader delays loading any scripts until polyfills are loaded. This can create problems when you rely on specific loading behavior. You can exclude certain scripts with the `exclude` option.

<details>
<summary>View example</summary>

```js
const config = {
  exclude: {
    jsScripts: true,
    jsModules: true,
    inlineJsScripts: true,
    inlineJsModules: true,
  },
};
```

</details>

#### polyfillsDir

Which directory to load polyfills from. By default, this is `./polyfills`

<details>
<summary>View example</summary>

```js
const config = {
  polyfillsDir: './generated-files',
};
```

</details>

#### minify

Whether the code output should be minified.

<details>
<summary>View example</summary>

```js
const config = {
  minify: true,
};
```

</details>

## Usage

### createPolyfillsLoader

The `createPolyfillsLoader` function takes configuration and returns the javascript code for the polyfills loader. It also returns information about the generated polyfill files, these will need to be made available at runtime so that they can be imported by the loader code.

```js
const { createPolyfillsLoader } = require('polyfills-loader');

const result = createPolyfillsLoader({
  // see configuration above
});

console.log(result.code);
console.log(result.polyfillFiles);
```

### injectPolyfillsLoader

The `injectPolyfillsLoader` function injects a polyfills loader into an existing HTML page. It also injects polyfills for any import maps it finds.

```js
const { injectPolyfillsLoader } = require('polyfills-loader');

const html = `
<html>
 <head></head>
 <body></body>
</html>
`;

const result = injectPolyfillsLoader(html, {
  // see configuration above
});

console.log(result.htmlString);
console.log(result.polyfillFiles);
```
