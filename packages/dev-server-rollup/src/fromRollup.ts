import { Plugin as RollupPlugin } from 'rollup';
import { rollupAdapter } from './rollupAdapter';

type FnArgs = readonly unknown[];
type RollupPluginFn<T extends FnArgs> = (...args: T) => RollupPlugin;

export function fromRollup<T extends FnArgs>(rollupPluginFn: RollupPluginFn<T>) {
  // return a function wrapper which intercepts creation of the rollup plugin
  return function wrappedRollupPluginFn(...args: T) {
    // call the original plugin function
    const rollupPlugin = rollupPluginFn(...args);
    // wrap the rollup plugin in an adapter for web dev server
    return rollupAdapter(rollupPlugin);
  };
}
