# Dev Server >> CLI and Configuration ||2

The dev server can be configured using CLI flags, or with a configuration file.

## CLI flags

| name              | type         | description                                                                                                          |
| ----------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| root-dir          | string       | the root directory to serve files from. Defaults to the current working directory                                    |
| open              | boolean      | Opens the browser on app-index, root dir or a custom path                                                            |
| app-index         | boolean      | The app's index.html file. When set, serves the index.html for non-file requests. Use this to enable SPA routing     |
| watch             | boolean      | runs in watch mode, reloading on file changes                                                                        |
| node-resolve      | boolean      | resolve bare module imports                                                                                          |
| esbuild-target    | string array | JS language target to compile down to using esbuild. Recommended value is "auto", which compiles based on user-agent |
| preserve-symlinks | boolean      | preserve symlinks when resolving imports                                                                             |
| config            | object       | where to read the config from                                                                                        |
| debug             | boolean      | whether to log debug messages                                                                                        |
| help              | boolean      | List all possible commands                                                                                           |

Examples:

```
web-dev-server --open
web-dev-server --node-resolve
web-dev-server --node-resolve --watch
web-dev-server --node-resolve --watch --app-index demo/index.html
web-dev-server --node-resolve --watch --app-index demo/index.html --esbuild-target auto
```

You can also use the shorthand `wds` command:

```
wds --node-resolve --watch --app-index demo/index.html --esbuild-target auto
```

## esbuild target

The `--esbuild-target` flag uses the [@web/dev-server-esbuild plugin](https://modern-web.dev/docs/dev-server/plugins/esbuild/) to compile JS to a compatible language version. Depending on what language features you are using and the browsers you are developing on, you may not need this flag.

If you need this flag, we recommend setting this to `auto`. This will compile based on user-agent, and skip work on modern browsers. [Check the docs](https://modern-web.dev/docs/dev-server/plugins/esbuild/) for all other possible options.

## Configuration file

Web dev server looks for a configuration file in the current working directory called `web-dev-server.config`.

The file extension can be `.js`, `.cjs` or `.mjs`. A `.js` file will be loaded as an es module or common js module based on your version of node, and the package type of your project.

We recommend writing the configuration using [node js es module](https://nodejs.org/api/esm.html) syntax and using the `.mjs` file extension to make sure your config is always loaded correctly. All the examples in our documentation use es module syntax.

A config written as es module `web-dev-server.config.mjs`:

```js
export default {
  open: true,
  nodeResolve: true,
  appIndex: 'demo/index.html'
  // in a monorepo you need to set set the root dir to resolve modules
  rootDir: '../../',
};
```

A config written as commonjs `web-dev-server.config.js`:

```js
module.exports = {
  open: true,
  nodeResolve: true,
  appIndex: 'demo/index.html'
  // in a monorepo you need to set set the root dir to resolve modules
  rootDir: '../../',
};
```

A configuration file accepts most of the command line args camel-cased, with some extra options. These are the full type definitions:

```ts
import { Plugin, Middleware } from '@web/dev-server';

type MimeTypeMappings = Record<string, string>;

interface DevServerConfig {
  // whether to open the browser and/or the browser path to open on
  open?: 'string' | boolean;
  // index HTML to use for SPA routing / history API fallback
  appIndex?: string;
  // run in watch mode, reloading when files change
  watch?: boolean;
  // resolve bare module imports
  nodeResolve?: boolean | RollupNodeResolveOptions;
  // preserve symlinks when resolving bare module imports
  preserveSymlinks?: boolean;
  // JS language target to compile down to using esbuild. Recommended value is "auto", which compiles based on user agent.
  esbuildTarget?: string | string[];
  // preserve symlinks when resolve imports, instead of following
  // symlinks to their original files
  preserveSymlinks?: boolean;
  // the root directory to serve files from. this is useful in a monorepo
  // when executing commands from a package
  rootDir?: string;
  /**
   * Whether to log debug messages.
   */
  debug?: boolean;

  // files to serve with a different mime type
  mimeTypes?: MimeTypeMappings;
  // middleware used by the server to modify requests/responses, for example to proxy
  // requests or rewrite urls
  middleware?: Middleware[];
  // plugins used by the server to serve or transform files
  plugins?: Plugin[];

  // configuration for the server
  protocol?: string;
  hostname?: string;
  port?: number;

  // whether to run the server with HTTP2
  http2?: boolean;
  // path to SSL key
  sslKey?: string;
  // path to SSL certificate
  sslCert?: string;
}
```
