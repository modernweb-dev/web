import { Config } from '../Config';
import { Plugin } from '../Plugin';
import { resolveModuleImportsPlugin } from '../plugins/resolveModuleImportsPlugin';
import { eventStreamPlugin } from '../event-stream/eventStreamPlugin';

export function createPlugins(config: Config) {
  const plugins: Plugin[] = [];

  if (config.plugins.some(pl => 'resolveImport' in pl)) {
    plugins.push(resolveModuleImportsPlugin(config.plugins, config.rootDir));
  }

  if (config.plugins.some(pl => pl.injectEventStream)) {
    plugins.push(eventStreamPlugin());
  }

  return plugins;
}
