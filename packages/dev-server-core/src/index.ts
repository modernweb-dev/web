// reexports of types from internal libraries
import WebSocket from 'ws';
export { FSWatcher } from 'chokidar';
export { default as Koa, type Context, type Middleware } from 'koa';
export { Server } from 'net';
export type { ErrorWithLocation, Logger } from './logger/Logger.js';
export { PluginError } from './logger/PluginError.js';
export { PluginSyntaxError } from './logger/PluginSyntaxError.js';
export type { Plugin, ResolveOptions, ServerStartParams } from './plugins/Plugin.js';
export { DevServer } from './server/DevServer.js';
export type { DevServerCoreConfig, MimeTypeMappings } from './server/DevServerCoreConfig.js';
export {
  getHtmlPath,
  getRequestBrowserPath,
  getRequestFilePath,
  getResponseBody,
  isInlineScriptRequest,
} from './utils.js';
export { WebSocketsManager, type WebSocketData } from './web-sockets/WebSocketsManager.js';
export { WebSocket };
