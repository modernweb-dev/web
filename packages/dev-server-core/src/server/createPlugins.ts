import { DevServerCoreConfig } from '../DevServerCoreConfig';
import { Plugin } from '../Plugin';
import { transformModuleImportsPlugin } from '../plugins/transformModuleImportsPlugin';
import { eventStreamPlugin } from '../event-stream/eventStreamPlugin';
import { mimeTypesPlugin } from '../plugins/mimeTypesPlugin';

export function createPlugins(config: DevServerCoreConfig) {
  const plugins: Plugin[] = [];

  if (config.mimeTypes && Object.keys(config.mimeTypes).length > 0) {
    plugins.push(mimeTypesPlugin(config.mimeTypes));
  }

  if (config.plugins?.some(pl => 'resolveImport' in pl || 'transformImport' in pl)) {
    plugins.push(transformModuleImportsPlugin(config.plugins, config.rootDir));
  }

  if (config.eventStream && config.plugins?.some(pl => pl.injectEventStream)) {
    plugins.push(eventStreamPlugin());
  }

  return plugins;
}
