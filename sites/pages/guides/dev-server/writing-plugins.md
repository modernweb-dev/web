# Dev Server >> Writing plugins ||60

Plugins are objects with lifecycle hooks called by Web Dev Server and Web Test Runner as it serves files to the browser. They can be used to serve virtual files, transform files, or resolve module imports.

Plugins share a similar API to [rollup](https://github.com/rollup/rollup) plugins. A plugin is an object that you add to the `plugins` array in your configuration file. You can add an object directly inline, or create one from a function somewhere.

In this guide, we show a few basic examples of how to write your plugin. See the [full documentation](../../docs/dev-server/writing-plugins/overview.md) for the full API.

## Injecting code

Let's create a basic plugin that injects something into our HTML page.

First, create a `web-dev-server.config.mjs` file with an empty plugins array:

```js
export default {
  plugins: [],
};
```

Next, we add a simple skeleton of our plugin:

```js
export default {
  plugins: [
    {
      name: 'test-plugin',
      serve(context) {
        console.log('serving file', context.path);
      },
      transform(context) {
        console.log('transforming file', context.path);
      },
    },
  ],
};
```

The `serve` hook is called whenever the browser requests something from the dev server. By default, the dev server will try to match the request to a file on the server. You can use this hook to serve the file from your plugin instead.

The `transform` hook is called for each file served by the dev server, giving you the ability to transform it before sending it to the browser.

Let's see if our basic plugin works. Create `/demo/index.html` file:

```html
<!DOCTYPE html>
<html>
  <body>
    <p>Hello world!</p>
  </body>
</html>
```

And start the server:

```
npx web-dev-server --open /demo/
```

We should see two messages logged to the node js terminal:

```
serving file /demo/index.html
transforming file /demo/index.html
```

Now let's update our plugin to make a change to our code:

```js
export default {
  plugins: [
    {
      name: 'inject-html-plugin',
      transform(context) {
        if (context.path === '/demo/') {
          return context.body.replace('</body>', '<p>Injected by my plugin</p></body>');
        }
      },
    },
  ],
};
```

Here we check if the transform hook is called with our demo page. `context.body` holds the response string, and we returned the transformed value we want to serve to the browser instead.

If we now refresh the browser, we should see the injected message appear on the screen.

## Environment variables

A great use case for the `serve` hook is to serve a virtual module for environment variables.

Let's create a javascript module at `/src/logger.js` that behaves differently based on the environment:

```js
import { environment } from '/environment.js';

export function logDebug(msg) {
  if (environment === 'development') {
    console.log(msg);
  }
}
```

Create a `web-dev-server.config.mjs` file with a plugin that returns the code for this `/environment.js` module:

```js
export default {
  plugins: [
    {
      name: 'environment',
      serve(context) {
        if (context.path === '/environment.js') {
          return 'export const environment = "development";';
        }
      },
    },
  ],
};
```

And add a `/demo/index.html` file which uses our logger module:

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">
      import { logDebug } from '../src/logger.js';

      logDebug('Hello world debug');
    </script>
  </body>
</html>
```

Start the dev server:

```
npx web-dev-server --open /demo/
```

And we should see `"Hello world debug"` logged to the browser console.

If you change the environment to be "production" and restart the server, the message should not be logged.

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/dev-server).
See the [documentation of @web/dev-server](../../docs/dev-server/overview.md).
