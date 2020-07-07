import { rollupAdapter } from '@web/dev-server-rollup';
import { nodeResolve, RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';

export function nodeResolvePlugin(
  rootDir: string,
  preserveSymlinks?: boolean,
  userOptions?: RollupNodeResolveOptions,
) {
  const userOptionsObject = typeof userOptions === 'object' ? userOptions : {};
  const options: RollupNodeResolveOptions = {
    rootDir,
    extensions: ['.ts', '.tsx', '.jsx', '.mjs', '.js', '.json'],
    // allow resolving polyfills for nodejs libs
    preferBuiltins: false,
    ...userOptionsObject,
  };
  return rollupAdapter(nodeResolve(options), { preserveSymlinks });
}
