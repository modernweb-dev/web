import { FSWatcher } from 'chokidar';
import Koa, { Context } from 'koa';
import { Server } from 'net';

import { DevServerCoreConfig } from './DevServerCoreConfig';
import { Logger } from './logger/Logger';
import { EventStreamManager } from './event-stream/EventStreamManager';

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
  eventStreams?: EventStreamManager;
}

export interface Plugin {
  name: string;
  injectEventStream?: boolean;
  serverStart?(args: ServerArgs): void | Promise<void>;
  serverStop?(): void | Promise<void>;
  serve?(context: Context): ServeResult | Promise<ServeResult>;
  transform?(context: Context): TransformResult | Promise<TransformResult>;
  transformCacheKey?(context: Context): string | undefined | Promise<string> | Promise<undefined>;
  resolveImport?(args: {
    source: string;
    context: Context;
  }): ResolveResult | Promise<ResolveResult>;
  transformImport?(args: {
    source: string;
    context: Context;
  }): ResolveResult | Promise<ResolveResult>;
  resolveMimeType?(context: Context): ResolveMimeTypeResult | Promise<ResolveMimeTypeResult>;
}
