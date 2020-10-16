import { DevServerCoreConfig } from '../DevServerCoreConfig';
import { transformModuleImportsPlugin } from '../plugins/transformModuleImportsPlugin';
import { webSocketsPlugin } from '../web-sockets/webSocketsPlugin';
import { mimeTypesPlugin } from '../plugins/mimeTypesPlugin';

export function addPlugins(config: DevServerCoreConfig) {
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
    config.plugins.push(transformModuleImportsPlugin(config.plugins, config.rootDir));
  }
}
