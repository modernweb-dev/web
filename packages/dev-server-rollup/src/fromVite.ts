import { VitePlugin, viteAdapter } from './viteAdapter.js';
import { RollupAdapterOptions } from './rollupAdapter.js';

type FnArgs = readonly unknown[];
type VitePluginFn<T extends FnArgs> = (...args: T) => VitePlugin;

/**
 * Wraps a Vite plugin factory function so that it returns a Web Dev Server plugin.
 *
 * Usage:
 * ```js
 * import { fromVite } from '@web/dev-server-rollup';
 * import viteMyPlugin from 'vite-plugin-my-plugin';
 *
 * export default {
 *   plugins: [fromVite(viteMyPlugin)({ option: 'value' })],
 * };
 * ```
 *
 * If the plugin object is already instantiated, wrap it in an arrow function:
 * ```js
 * fromVite(() => instantiatedPlugin)()
 * ```
 */
export function fromVite<T extends FnArgs>(
  vitePluginFn: VitePluginFn<T>,
  adapterOptions: RollupAdapterOptions = {},
) {
  if (typeof vitePluginFn !== 'function') {
    throw new Error(
      `fromVite should be called with a Vite plugin factory function. Received: ${vitePluginFn}`,
    );
  }

  return function wrappedVitePluginFn(...args: T) {
    const plugin = vitePluginFn(...args);
    return viteAdapter(plugin, adapterOptions);
  };
}
