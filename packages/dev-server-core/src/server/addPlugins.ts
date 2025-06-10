import { DevServerCoreConfig } from './DevServerCoreConfig.js';
import { transformModuleImportsPlugin } from '../plugins/transformModuleImportsPlugin.js';
import { webSocketsPlugin } from '../web-sockets/webSocketsPlugin.js';
import { mimeTypesPlugin } from '../plugins/mimeTypesPlugin.js';
import { Logger } from '../logger/Logger.js';

export function addPlugins(logger: Logger, config: DevServerCoreConfig) {
  if (!config.plugins) {
    config.plugins = [];
  }

  if (config.mimeTypes && Object.keys(config.mimeTypes).length > 0) {
    config.plugins.unshift(mimeTypesPlugin(config.mimeTypes));
  }

  if (config.injectWebSocket && config.plugins?.some(pl => pl.injectWebSocket)) {
    config.plugins.unshift(webSocketsPlugin());
  }

  if (config.plugins?.some(pl => 'resolveImport' in pl || 'transformImport' in pl)) {
    // transform module imports must happen after all other plugins did their regular transforms
    config.plugins.push(transformModuleImportsPlugin(logger, config.plugins, config.rootDir));
  }
}
