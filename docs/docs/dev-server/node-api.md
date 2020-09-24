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

## Advanced

If you need more control than what `startDevServer` gives you, you can also use the individual pieces that make up the dev server directly.

We don't expose this currently, if this is something you need let us know so that we can understand your use case.
