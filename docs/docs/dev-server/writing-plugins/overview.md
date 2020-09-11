---
title: Overview
eleventyNavigation:
  key: Writing Plugins Overview
  title: Overview
  parent: Writing Plugins
  order: 1
---

A plugin is an object that you add to the `plugins` array in your configuration file. You can add an object directly, or create one from a function somewhere:

In your `web-dev-server.config.js` or `web-test-runner.config.js`:

```js
import awesomePlugin from 'awesome-plugin';

export default {
  plugins: [
    // use a plugin
    awesomePlugin({ someOption: 'someProperty' }),
    // create an inline plugin
    {
      name: 'my-plugin',
      transform(context) {
        if (context.response.is('html')) {
          return { body: context.body.replace(/<base href=".*">/, '<base href="/foo/">') };
        }
      },
    },
  ],
};
```

This is the full type interface for all options:

```ts
import { FSWatcher } from 'chokidar';
import Koa, { Context } from 'koa';
import { Server } from 'net';

import { DevServerCoreConfig, Logger, WebSocketsManager } from '@web/dev-server-core';

export type ServeResult =
  | void
  | string
  | { body: string; type?: string; headers?: Record<string, string> };
export type TransformResult =
  | void
  | string
  | { body?: string; headers?: Record<string, string>; transformCache?: boolean };
export type ResolveResult = void | string | { id?: string };
export type ResolveMimeTypeResult = void | string | { type?: string };

export interface ServerArgs {
  config: DevServerCoreConfig;
  app: Koa;
  server: Server;
  fileWatcher: FSWatcher;
  logger: Logger;
  webSockets?: WebSocketsManager;
}

export interface Plugin {
  name: string;
  injectWebSocket?: boolean;
  serverStart?(args: ServerArgs): void | Promise<void>;
  serverStop?(): void | Promise<void>;
  serve?(context: Context): ServeResult | Promise<ServeResult>;
  transform?(context: Context): TransformResult | Promise<TransformResult>;
  transformCacheKey?(context: Context): string | undefined | Promise<string> | Promise<undefined>;
  resolveImport?(args: {
    source: string;
    context: Context;
    code?: string;
    column?: number;
    line?: number;
  }): ResolveResult | Promise<ResolveResult>;
  transformImport?(args: {
    source: string;
    context: Context;
    code?: string;
    column?: number;
    line?: number;
  }): ResolveResult | Promise<ResolveResult>;
  resolveMimeType?(context: Context): ResolveMimeTypeResult | Promise<ResolveMimeTypeResult>;
}
```
