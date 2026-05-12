// reexports of types from internal libraries
export { FSWatcher } from 'chokidar';
export { default as Koa, Context, Middleware } from 'koa';
export { Server } from 'net';
import WebSocket from 'ws';
export { WebSocket };

export { DevServer } from './server/DevServer.ts';
export { Plugin, ServerStartParams, ResolveOptions } from './plugins/Plugin.ts';
export { DevServerCoreConfig, MimeTypeMappings } from './server/DevServerCoreConfig.ts';
export { WebSocketsManager, WebSocketData } from './web-sockets/WebSocketsManager.ts';
export {
  getRequestBrowserPath,
  getRequestFilePath,
  getResponseBody,
  getHtmlPath,
  isInlineScriptRequest,
} from './utils.ts';
export { Logger, ErrorWithLocation } from './logger/Logger.ts';
export { PluginSyntaxError } from './logger/PluginSyntaxError.ts';
export { PluginError } from './logger/PluginError.ts';
