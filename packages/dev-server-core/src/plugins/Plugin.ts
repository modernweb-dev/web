import { FSWatcher } from 'chokidar';
import Koa, { Context } from 'koa';
import { Server } from 'net';

import { DevServerCoreConfig } from '../server/DevServerCoreConfig';
import { Logger } from '../logger/Logger';
import { WebSocketsManager } from '../web-sockets/WebSocketsManager';

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

export interface ServerStartParams {
  config: DevServerCoreConfig;
  app: Koa;
  server: Server;
  fileWatcher: FSWatcher;
  logger: Logger;
  webSockets?: WebSocketsManager;
}

export interface ResolveOptions {
  isEntry?: boolean;
  skipSelf?: boolean;
  [key: string]: unknown;
}

export interface Plugin {
  name: string;
  injectWebSocket?: boolean;
  serverStart?(args: ServerStartParams): void | Promise<void>;
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
    resolveOptions?: ResolveOptions;
  }): ResolveResult | Promise<ResolveResult>;
  resolveImportSkip?(context: Context, source: string, importer: string): void;
  transformImport?(args: {
    source: string;
    context: Context;
    code?: string;
    column?: number;
    line?: number;
  }): ResolveResult | Promise<ResolveResult>;
  resolveMimeType?(context: Context): ResolveMimeTypeResult | Promise<ResolveMimeTypeResult>;
  fileParsed?(context: Context): void;
}
