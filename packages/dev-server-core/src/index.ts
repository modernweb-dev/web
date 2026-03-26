// reexports of types from internal libraries
export { FSWatcher } from 'chokidar';
export { default as Koa } from 'koa';
export type { Context, Middleware } from 'koa';
export type { Server } from 'net';
import WebSocket from 'ws';
export { WebSocket };

export { DevServer } from './server/DevServer.ts';
export type { Plugin, ServerStartParams, ResolveOptions } from './plugins/Plugin.ts';
export type { DevServerCoreConfig, MimeTypeMappings } from './server/DevServerCoreConfig.ts';
export { WebSocketsManager } from './web-sockets/WebSocketsManager.ts';
export {
  getRequestBrowserPath,
  getRequestFilePath,
  getResponseBody,
  getHtmlPath,
  isInlineScriptRequest,
} from './utils.ts';
export type { Logger, ErrorWithLocation } from './logger/Logger.ts';
export { PluginSyntaxError } from './logger/PluginSyntaxError.ts';
export { PluginError } from './logger/PluginError.ts';
export type { WebSocketData } from './web-sockets/WebSocketsManager.ts';
