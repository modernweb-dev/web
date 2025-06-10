# Going Buildless >> ES Modules ||60

All modern browsers support standard es modules. These are javascript files using `import` and `export` statements:

```js
import foo from './foo.js';

export function doBar() {
  return foo + 'bar';
}
```

In contrast to classic scripts, variables declared inside modules are scoped to the file itself. This makes them especially useful for writing modular code, explicitly declaring the API surface using exports.

## Loading modules

### Module scripts

You can load javascript modules using scripts with `type="module"`. You can reference the module file using `src`, or write the module directly inline.

```html
<html>
  <body>
    <script type="module" src="./app.js"></script>
    <script type="module">
      import './app.js';

      console.log('hello world from my module');
    </script>
  </body>
</html>
```

### Static imports

A module can import other modules using static imports. These imports are executed eagerly, the browser will download the statically imported modules before running the code in your module.

```js
import { foo } from './foo.js';
```

### Dynamic imports

You can also import other modules using dynamic [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) function. This import is executed lazily, the browser will download the file only when the function is executed.

```js
function loadComponent() {
  return import('./components/my-component.js');
}
```

Because of the nature of dynamic imports, the above function returns a promise, so you need to use the `await` keyword:

```js
const component = await loadComponent();

component.doSomething();
```

## File extensions

You will often see es modules using the `.mjs` file extension. For node js the `.mjs` file extension is an indication to execute the file as an es module. Node js will treat a file as an es module if it has a `.mjs` file extension, or if it has `.js` file extension and the `package.json` has `type="module"` set.

For the browser, the file extension doesn't matter, it only looks at the content-type header that was sent by the server. Web servers infer the content-type from the file extension, and not all web servers support the `.mjs` file extension.

## Import paths

In the browser import paths should be the full path to the module you want to import, either absolute or relative to your module. It should include the file extension as well.

For example:

```js
import foo from '../node_modules/foo/index.js';
```

In NodeJS there is logic to resolve modules imports so that you can use bare module imports or imports without file extensions:

```js
import foo from 'foo';
import bar from './bar';
```

This doesn't work in the browser because it doesn't have direct access to the file system to resolve the paths.

Both [@web/test-runner](../../docs/test-runner/overview.md) and [@web/dev-server](../../docs/dev-server/overview.md) support the `--node-resolve` flag to resolve these kinds of imports server-side before serving them to the browser.

## Referencing Reusable Assets with `import.meta.url`

When publishing reusable [modules](./es-modules.md), you may want to include assets like images and CSS. Consider the following structure:

```
root
├── modules
│   ├── module.js
│   └── asset.webp
└── index.html
```

```js
const imgSrc = './asset.webp';
const image = document.createElement('img');
image.src = imgSrc;
document.body.appendChild(image);
```

if `index.html` loaded `modules/module.js`, the image could not display, because the browser would request `/asset.webp` instead of `/modules/asset.webp`, as the author intended.

As of this writing, the es-module standard does not yet have a way of [importing non-javascript assets](https://github.com/tc39/proposal-import-assertions). If you tried to load assets using relative URLs, they would load relative to the _document_ rather than the _module_ path.

However, you can still publish modules that load bundled resources at runtime by using [`import.meta`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta), a special object provided by the runtime which contains information about the current module.

```js
const imgSrc = new URL('./asset.webp', import.meta.url);
const image = document.createElement('img');
image.src = imgSrc.href;
document.body.appendChild(image);
```

This works by using the optional `base` parameter to the `URL` constructor, which in this case functions similarly to nodejs `path.resolve`.

## CommonJS modules

CommonJS is the original module system of node and predates standard es modules. You can recognize this type of module by the use of `require` and `module.exports`:

```js
const foo = require('./foo');

module.exports.doBar = function doBar() {
  return foo + 'bar';
};
```

This doesn't work in the browser, as it doesn't know what to do with CommonJS modules. While node now supports es modules natively, a lot of code is still written as CommonJS modules. If you want to use a library written in CommonJS, there are a couple of options to look into.

### Look for an es module distribution

Many libraries are already shipping es module variants, but you need to do some digging to find out. For example, sometimes you need to import it from their `dist` or `lib` folder.

```js
import foo from 'foo/dist/foo.mjs';
```

Inspect your `node_modules` folder to see if you can find it, or check the docs if that's been documented.

### Ask the author to distribute an ESM distribution

Package authors need to know about user demand, so it's important to always create an issue asking for an ESM distribution. Sometimes authors are quick to pick it up and add a distribution.

### Look for a forked ESM distribution

There are a few projects where people set up forks of popular libraries, providing an es module distribution. These forks can get out of date, though some have set up automated version bumping.

Popular collections of forks are [@esm-bundle](https://github.com/esm-bundle/) and [@bundled-es-modules](https://github.com/bundled-es-modules).

### Create a UMD wrapper

UMD modules are "universal modules", meaning they support multiple module formats in a single file. It's quite an old standard, and it doesn't support standard es modules, so it's not quite "universal" anymore. However, many libraries ship a UMD version where the library and its dependencies are bundled into a single file. It's been the way to ship code for the browser for a long time.

You can actually import these libraries using a module import, but instead of exporting something, the UMD module will register itself to the window. You can set up a proxy file to reexport this variable from the window.

A good example of this is the chai library:

`test/chai.js`:

```js
// import the chai UMD file
import 'chai/chai.js';

// get a reference to chai on the window
const chai = window.chai;
const { expect, assert } = chai;

// reexport chai
export default chai;
// reexport names exports from chai
export { expect, assert };
```

`test/my-element.test.js`:

```js
import { expect } from './chai.js';

expect('foo').to.equal('bar');
```

This approach has the downside of polluting the global scope. And you can only use a single version of this library since different versions would overwrite each other. This makes it unsuitable for shared code, but this is a good option for applications and tests.

### Use the JSPM CDN

JSPM is a CDN which ships es module variants of the NPM registry, using a clever build system to transform CommonJS into es modules. You could import from your CDN directly in your code. This will always require an internet connection and is unsuitable for published code. But it is an interesting option.

```js
import chai from 'https://jspm.dev/chai';
const { expect } = chai;

expect('foo').to.equal('bar');
```

### Transform CommonJS to ESM

Transforming CommonJS to es modules is not straightforward, and often requires some debugging and fiddling to get it working. It also locks your project into requiring a specific build setup. However, it can be a good option if there is no other way around it.

#### CommonJS Plugin

For our dev server and test runner you can use [@rollup/plugin-commonjs](https://www.npmjs.com/package/@rollup/plugin-commonjs):

```js
const rollupCommonjs = require('@rollup/plugin-commonjs');
const { fromRollup } = require('@web/dev-server-rollup');

const commonjs = fromRollup(rollupCommonjs);

module.exports = {
  plugins: [
    commonjs({
      include: ['./node_modules/foo/**/*', './node_modules/bar/**/*', './node_modules/baz/**/*'],
    }),
  ],
};
```

It's highly recommended to always list out which packages you want to transform explicitly. The commonjs plugin slows down the server for each file it processes.

If you are using a monorepo, you need to use a pattern like this:

```js
'../../**/node_modules/foo/**/*',
'../../**/node_modules/bar/**/*',
'../../**/node_modules/baz/**/*',
```

#### Importing CommonJS modules

After adding the plugin, you can import CommonJS modules as if they are es modules using a default import:

```js
import foo from 'foo';
```

For some modules it's also possible to use named imports:

```js
import { doFoo, doBar } from 'foo';
```

However since CommonJS is a dynamic format, it's not always possible to detect all patterns. There is ongoing work to improve this detection behavior, you can follow [this issue](https://github.com/rollup/plugins/issues/481) for more information.
