import { InputOptions, Plugin as RollupPlugin } from 'rollup';
import { rollupAdapter } from './rollupAdapter.js';

type FnArgs = readonly unknown[];
type RollupPluginFn<T extends FnArgs> = (...args: T) => RollupPlugin;

export interface FromRollupOptions {
  throwOnUnresolvedImport?: boolean;
}

export function fromRollup<T extends FnArgs>(
  rollupPluginFn: RollupPluginFn<T>,
  rollupInputOptions: Partial<InputOptions> = {},
  options: FromRollupOptions = {},
) {
  if (typeof rollupPluginFn !== 'function') {
    throw new Error(
      `fromRollup should be called with a rollup plugin function. Received: ${rollupPluginFn}`,
    );
  }

  // return a function wrapper which intercepts creation of the rollup plugin
  return function wrappedRollupPluginFn(...args: T) {
    // call the original plugin function
    const rollupPlugin = rollupPluginFn(...args);
    // wrap the rollup plugin in an adapter for web dev server
    return rollupAdapter(rollupPlugin, rollupInputOptions, options);
  };
}
