# Dev Server >> Loading modules ||20

In the previous guide, we learned how to install the dev server and create a simple webpage. In this section, we will learn how to load javascript modules.

## Adding a module script

To load module from HTML, we need to add a module script to our page. Let's start with a simple example:

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">
      console.log('Hello world!');
    </script>
  </body>
</html>
```

Save this to a file called `/demo/index.html` and start the server with `npx web-dev-server --open /demo/`. You should see `Hello world!` logged to the console.

## Loading other modules

The content of the script we added is executed as a module, which means that for example variables defined don't pollute the global scope. It also means we can import other modules.

For example, let's add a new file at `src/message.js` with the following content:

```js
export const message = 'This is a message';
```

And update the HTML page to import this module:

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">
      import { message } from '../src/message.js';

      console.log('Hello world!');
      console.log(message);
    </script>
  </body>
</html>
```

After reloading the page, we should see the new message logged to the console.

From here onward we can further build up the module graph of our application. Each module can import other modules and export variables.

## Module paths

Module imports must always point to actual files on the file system. The browser resolves imports relative to the module location, but it does not apply extra logic such as adding file extensions.

## Node modules

A common practice when working with packages installed through a package manager like NPM is to import the package by name:

```js
import { html } from 'lit-html';
```

In the browser we can import these packages using an explicit import path:

```js
import { html } from '../node_modules/lit-html/lit-html.js';
```

We can also make the dev server do this for us, rewriting the paths before it reaches the browser. We can do this by adding the `--node-resolve` flag.

Let's try this out by installing an NPM package in our project:

```
npm i --save lit-html
```

And update our `/demo/index.html` page to include an import to the `lit-html` package:

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">
      import { html, render } from 'lit-html';
      import { message } from '../src/message.js';

      console.log('Hello world!');
      console.log(message);

      render(html` <p>Hello lit-html</p> `, document.body);
    </script>
  </body>
</html>
```

Next, we start the dev server with the node resolve flag:

```
npx web-dev-server --open /demo/ --node-resolve
```

We should see `Hello lit-html` on the page.

See the [official docs](../../docs/dev-server/cli-and-configuration.md#node-resolve-options) for more information on the node resolve option.

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/dev-server).
See the [documentation of @web/dev-server](../../docs/dev-server/overview.md).
