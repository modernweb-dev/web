// reexports of types from internal libraries
export { FSWatcher } from 'chokidar';
export { default as Koa, Context, Middleware } from 'koa';
export { Server } from 'net';
import WebSocket from 'ws';
export { WebSocket };

export { DevServer } from './server/DevServer.js';
export { Plugin, ServerStartParams, ResolveOptions } from './plugins/Plugin.js';
export { DevServerCoreConfig, MimeTypeMappings } from './server/DevServerCoreConfig.js';
export { WebSocketsManager, WebSocketData } from './web-sockets/WebSocketsManager.js';
export {
  getRequestBrowserPath,
  getRequestFilePath,
  getResponseBody,
  getHtmlPath,
  isInlineScriptRequest,
} from './utils.js';
export { Logger, ErrorWithLocation } from './logger/Logger.js';
export { PluginSyntaxError } from './logger/PluginSyntaxError.js';
export { PluginError } from './logger/PluginError.js';
