import { DevServerCoreConfig } from '../DevServerCoreConfig';
import { Plugin } from '../Plugin';
import { transformModuleImportsPlugin } from '../plugins/transformModuleImportsPlugin';
import { webSocketsPlugin } from '../web-sockets/webSocketsPlugin';
import { mimeTypesPlugin } from '../plugins/mimeTypesPlugin';

export function createPlugins(config: DevServerCoreConfig) {
  const plugins: Plugin[] = [];

  if (config.mimeTypes && Object.keys(config.mimeTypes).length > 0) {
    plugins.push(mimeTypesPlugin(config.mimeTypes));
  }

  if (config.plugins?.some(pl => 'resolveImport' in pl || 'transformImport' in pl)) {
    plugins.push(transformModuleImportsPlugin(config.plugins, config.rootDir));
  }

  if (config.injectWebSocket && config.plugins?.some(pl => pl.injectWebSocket)) {
    plugins.push(webSocketsPlugin());
  }

  return plugins;
}
