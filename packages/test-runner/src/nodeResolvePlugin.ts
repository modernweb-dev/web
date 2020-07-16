import { rollupAdapter } from '@web/dev-server-rollup';
import { nodeResolve, RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import deepmerge from 'deepmerge';

export function nodeResolvePlugin(
  rootDir: string,
  preserveSymlinks?: boolean,
  userOptions?: RollupNodeResolveOptions,
) {
  const userOptionsObject = typeof userOptions === 'object' ? userOptions : {};
  const options: RollupNodeResolveOptions = deepmerge(
    {
      rootDir,
      extensions: ['.ts', '.tsx', '.jsx', '.mjs', '.js', '.json'],
      customResolveOptions: {
        moduleDirectory: ['node_modules', 'web_modules'],
      },
      browser: true,
      // allow resolving polyfills for nodejs libs
      preferBuiltins: false,
    },
    userOptionsObject,
  );

  return rollupAdapter(nodeResolve(options), { preserveSymlinks });
}
