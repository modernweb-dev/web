# Dev Server >> Node API ||6

The Dev Server has a node API to start the server programmatically.

## startDevServer

The `startDevServer` function will start the dev server with all the default options, identical to using the `web-dev-server` or `wds` command. It returns a dev server instance.

```js
import { startDevServer } from '@web/dev-server';

async function main() {
  const server = await startDevServer();
}

main();
```

### Stopping the server

The dev server instance that the `startDevServer()` call above returns can be terminated by the asynchronous `stop()` method available on the instance.

```js
import { startDevServer } from '@web/dev-server';

async function main() {
  const server = await startDevServer();

  // Use the active server.

  // Clean up.
  await server.stop();
}

main();
```

This will collectively halt the file watcher passed into the server, any plugins you've configured, as well as all open connections to the server you are stopping.

### Configuration

This function takes a number of extra parameters:

```ts
interface StartDevServerParams {
  /**
   * Optional config to merge with the user-defined config.
   */
  config?: Partial<DevServerConfig>;
  /**
   * Whether to read CLI args. Default true.
   */
  readCliArgs?: boolean;
  /**
   * Whether to read a user config from the file system. Default true.
   */
  readFileConfig?: boolean;
  /**
   * Name of the configuration to read. Defaults to web-dev-server.config.{mjs,cjs,js}
   */
  configName?: string;
  /**
   * Whether to automatically exit the process when the server is stopped, killed or an error is thrown.
   */
  autoExitProcess?: boolean;
  /**
   * Whether to log a message when the server is started.
   */
  logStartMessage?: boolean;
  /**
   * Array to read the CLI args from. Defaults to process.argv.
   */
  argv?: string[];
}
```

For example you can start the server with a pre-defined config without reading anything from disk or CLI arguments.

```js
import { startDevServer } from '@web/dev-server';

async function main() {
  const server = await startDevServer({
    config: {
      rootDir: process.cwd(),
      port: 1234,
      watch: true,
    },
    readCliArgs: false,
    readFileConfig: false,
  });
}

main();
```

## Combine with your own CLI definitions

If you extend the dev-server and want to use `command-line-args` to add your own CLI definitions, it is recommended to use the [`partial` option](https://github.com/75lb/command-line-args/wiki/Partial-parsing).

```js
const myDefinitions = [
  {
    name: 'foo',
    type: String,
    description: 'Bar',
  },
];

const myConfig = commandLineArgs(myServerDefinitions, { partial: true });
```

This will allow you to do:

```
my-dev-server --port 8080 --foo="bar"
```

Which combines a command line arg from `@web/dev-server` with your own. Partial will make sure it does not error on the unknown `port` argument, instead it pushes this argument to `_unknown`.
You can then pass the `_unknown` options to the `startDevServer` in the `argv` property.

```js
import { startDevServer } from '@web/dev-server';

const myConfig = commandLineArgs(myServerDefinitions, { partial: true });

async function main() {
  const server = await startDevServer({
    argv: myConfig._unknown,
  });
}

main();
```

## Websockets Server

The WebSocketsManager is exposed in case you need more fine-grained control. It contains three helpers:

- `sendImport`: imports the given path, executing the module as well as a default export if it exports a function
- `sendConsoleLog`: logs a message to the browser console of all connected web sockets.
- `send`: sends messages to all connected web sockets.

If you want to use the WebSockets server directly to handle messages yourself, use the `webSocketServer` property.

```js
const { server, webSockets } = await startDevServer();

const wss = webSockets.webSocketServer;
wss.on('connection', ws => {
  ws.on('message', message => handleWsMessage(message, ws));
});
```

## Middleware mode

If you need to connect to an existing running web server with a compatible node middleware API (e.g. `express`), you can use `@web/dev-server` in middleware mode.

```js
import { startDevServer } from '@web/dev-server';

async function main() {
  const expressApp = express();
  expressApp.listen(1234);
  const { koaApp } = await startDevServer({
    config: {
      middlewareMode: true,
    },
  });
  expressApp.use(koaApp.callback());
}

main();
```

In this mode it will not start a new HTTP server, but rather allow you to use it's callback `koaApp.callback()` as a middleware in a parent server.

## Advanced

If you need more control than what `startDevServer` gives you, you can also use the individual pieces that make up the dev server directly.

We don't expose this currently, if this is something you need let us know so that we can understand your use case.
