# Dev Server >> Writing Plugins >> Hooks ||3

## Hook: serve

The serve hook can be used to serve virtual files from the server. The first plugin to respond with a body is used. It can return a Promise.

<details>
<summary>Read more</summary>

Serve an auto generated `index.html`:

```js
const indexHTML = generateIndexHTML();

export default {
  plugins: [
    {
      name: 'my-plugin',
      serve(context) {
        if (context.path === '/index.html') {
          return indexHTML;
        }
      },
    },
  ],
};
```

Serve a virtual module:

```js
export default {
  plugins: [
    {
      name: 'my-plugin',
      serve(context) {
        if (context.path === '/messages.js') {
          return 'export default "Hello world";';
        }
      },
    },
  ],
};
```

The file extension is used to infer the mime type to respond with. If you are using a non-standard file extension you need to use the `type` property to set it explicitly:

```js
export default {
  plugins: [
    {
      name: 'my-plugin',
      serve(context) {
        if (context.path === '/foo.xyz') {
          return { body: 'console.log("foo bar");', type: 'js' };
        }
      },
    },
  ],
};
```

</details>
&nbsp;

## Hook: resolveMimeType

Browsers don't use file extensions to know how to interpret files. Instead, they use [media or MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) which is set using the `content-type` header.

The dev server guesses the MIME type based on the file extension. When serving virtual files with non-standard file extensions, you can set the MIME type in the returned result (see the examples above). If you are transforming code from one format to another, you need to use the `resolveMimeType` hook.

<details>
<summary>Read more</summary>

The returned MIME type can be a file extension, this will be used to set the corresponding default MIME type. For example `js` resolves to `application/javascript` and `css` to `text/css`.

```js
export default {
  plugins: [
    {
      name: 'my-plugin',
      resolveMimeType(context) {
        // change all MD files to HTML
        if (context.path.endsWith('.md')) {
          return 'html';
        }
      },
    },
    {
      name: 'my-plugin',
      resolveMimeType(context) {
        // change all CSS files to JS, except for a specific file
        if (context.path.endsWith('.css') && context.path !== '/global.css') {
          return 'js';
        }
      },
    },
  ],
};
```

You can use a mime type shorthand, such as `js` or `css`. Koa will resolve this to the full mimetype. It is also possible to set the full mime type directly:

```js
export default {
  plugins: [
    {
      name: 'my-plugin',
      resolveMimeType(context) {
        if (context.response.is('md')) {
          return 'text/html';
        }
      },
    },
  ],
};
```

</details>
&nbsp;

## Hook: transform

The transform hook is called for each file and can be used to change a file's content before it is served to the browser. Multiple plugins can transform a single file. It can return a Promise.

This hook is useful for small modifications, such as injecting environment variables, or for compiling files to JS before serving them to the browser.

In a web server, the response body is not always a string, but it can be a binary buffer or stream. If the dev server sees that the response is utf-8, it will convert the body to a string for you to make writing transform plugins easier. If you are transforming non-standard file types, you may also need to include a `resolveMimeType` hook. A good example of this is `.ts` files, which in Koa defaults to a streaming video.

<details>
  <summary>Read more</summary>

Rewrite the base path of your application for local development:

```js
export default {
  plugins: [
    {
      name: 'my-plugin',
      transform(context) {
        if (context.path === '/index.html') {
          const transformedBody = context.body.replace(/<base href=".*">/, '<base href="/foo/">');
          return transformedBody;
        }
      },
    },
  ],
};
```

Inject a script to set global variables during local development:

```js
export default {
  plugins: [
    {
      name: 'my-plugin',
      transform(context) {
        if (context.path === '/index.html') {
          const transformedBody = context.body.replace(
            '</head>',
            '<script>window.process = { env: { NODE_ENV: "development" } }</script></head>',
          );
          return transformedBody;
        }
      },
    },
  ],
};
```

Inject environment variables into a JS module:

```js
import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

export default {
  plugins: [
    {
      name: 'my-plugin',
      transform(context) {
        if (context.path === '/src/environment.js') {
          return `export const version = '${packageJson.version}';`;
        }
      },
    },
  ],
};
```

Transform markdown to HTML:

```js
import { markdownToHTML } from 'markdown-to-html-library';

export default {
  plugins: [
    {
      name: 'my-plugin',
      resolveMimeType(context) {
        // this ensures the browser interprets .md files as .html
        if (context.path.endsWith('.md')) {
          return 'html';
        }
      },

      async transform(context) {
        // this will transform all MD files. if you only want to transform certain MD files
        // you can check context.path
        if (context.path.endsWith('.md')) {
          const html = await markdownToHTML(body);

          return html;
        }
      },
    },
  ],
};
```

Polyfill CSS modules in JS:

```js
export default {
  plugins: [
    {
      name: 'my-plugin',
      resolveMimeType(context) {
        if (context.path.endsWith('.css')) {
          return 'js';
        }
      },

      async transform(context) {
        if (context.path.endsWith('.css')) {
          const stylesheet = `
            const stylesheet = new CSSStyleSheet();
            stylesheet.replaceSync(${JSON.stringify(body)});
            export default stylesheet;
          `;

          return stylesheet;
        }
      },
    },
  ],
};
```

Set custom HTTP headers (e.g. for [COOP/COEP](https://web.dev/coop-coep/), [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy), etc.):

```js
export default {
  plugins: [
    {
      name: 'my-plugin',
      transform(context) {
        if (context.path === '/index.html') {
          context.set('X-My-Custom-Header', 'hello, world');
        }
      },
    },
  ],
};
```

</details>
&nbsp;

## Hook: resolveImport

The `resolveImport` hook is called for each module import. It can be used to resolve module imports before it reaches the browser. When a one plugin returns a resolved, further resolve hooks are not called.

<details>
  <summary>Read more</summary>

The dev server already resolves module imports when the `--node-resolve` flag is turned on. You can do the resolving yourself, or overwrite it for some files.

The hook receives the import string and should return the string to replace it with. This should be a browser-compatible path, not a file path.

```js
export default {
  plugins: [
    {
      name: 'my-plugin',
      async resolveImport({ source, context }) {
        const resolvedImport = fancyResolveLibrary(source);
        return resolvedImport;
      },
    },
  ],
};
```

</details>
&nbsp;

## Hook: transformImport

The `transformImport` hook is called for each module import. It can be used to transform module imports before they reach the browser. The difference from `resolveImport` is that this hook is always called for all plugins.

<details>
  <summary>Read more</summary>

The hook receives the import string and should return the string to replace it with. This should be a browser-compatible path, not a file path.

```js
export default {
  plugins: [
    {
      name: 'my-plugin',
      async transformImport({ source, context }) {
        return `${source}?foo=bar;
      },
    },
  ],
};
```

</details>
&nbsp;

## Hook: serverStart

The `serverStart` hook is called when the server starts. It is the ideal location to boot up other servers you will proxy to. It receives the server config, which you can use if plugins need access to general information such as the `rootDir` or `appIndex`. It also receives the HTTP server, Koa app, and `chokidar` file watcher instance. These can be used for more advanced plugins. This hook can be async, and it awaited before actually booting the server and opening the browser.

<details>
<summary>Read more</summary>

Accessing the serverStart parameters:

```js
import _glob from 'glob';
import { promisify } from 'util';
const glob = promisify(_glob);

function myFancyPlugin() {
  let rootDir;

  return {
    name: 'my-plugin',
    serverStart({ config, app, server, fileWatcher }) {
      // take the rootDir to access it later
      rootDir = config.rootDir;

      // register a koa middleware directly
      app.use((context, next) => {
        console.log(context.path);
        return next();
      });

      // register a single file to be watched
      fileWatcher.add('/README.md');

      // register multiple files to be watched
      const files = await glob('{elements}/**/*.{ts,css,html}', { cwd: process.cwd() });
      for (const file of files) {
        fileWatcher.add(file);
      }
    },
  };
}

export default {
  plugins: [myFancyPlugin()],
};
```

Boot up another server for proxying in serverStart:

```js
import proxy from 'koa-proxies';

export default {
  plugins: [
    {
      name: 'my-plugin',
      async serverStart({ app }) {
        // set up a proxy for certain requests
        app.use(
          proxy('/api', {
            target: 'http://localhost:9001',
          }),
        );

        // boot up the other server because it is awaited the dev server will also wait for it
        await startOtherServer({ port: 9001 });
      },
    },
  ],
};
```

</details>
&nbsp;

## Hook: serverStop

The `serverStop` hook is called when the server stops. You can use this to do cleanup work, such as closing connections

<details>
<summary>Read more</summary>

```js
function myFancyPlugin() {
  return {
    name: 'my-plugin',
    serverStop() {
      // cleanup
    },
  };
}

export default {
  plugins: [myFancyPlugin()],
};
```

Boot up another server for proxying in serverStart:

</details>
&nbsp;

## Koa Context

The plugin hooks receive the raw Koa `Context` object. This contains information about the server's request and response. Check the [Koa documentation](https://koajs.com/) to learn more about this.

To transform specific kinds of files we don't recommend relying on file extensions. Other plugins may be using non-standard file extensions. Instead, you should use the server's MIME type or content-type header. You can check by using the `context.response.is()` function. This is used a lot in the examples above.

Because files can be requested with query parameters and hashes, we recommend using `context.path` for reading the path segment of the URL only. If you do need to access search parameters, we recommend using `context.URL.searchParams.get('my-parameter')`.
