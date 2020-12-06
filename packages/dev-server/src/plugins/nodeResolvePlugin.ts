import { rollupAdapter } from '@web/dev-server-rollup';
import { Plugin } from '@web/dev-server-core';
import { nodeResolve, RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import deepmerge from 'deepmerge';

export function nodeResolvePlugin(
  rootDir: string,
  preserveSymlinks?: boolean,
  userOptions?: RollupNodeResolveOptions,
): Plugin {
  const userOptionsObject = typeof userOptions === 'object' ? userOptions : {};
  const options: RollupNodeResolveOptions = deepmerge(
    {
      rootDir,
      extensions: ['.mjs', '.js', '.cjs', '.jsx', '.json', '.ts', '.tsx'],
      moduleDirectories: ['node_modules', 'web_modules'],
      // allow resolving polyfills for nodejs libs
      preferBuiltins: false,
    },
    userOptionsObject,
  );

  return rollupAdapter(
    nodeResolve(options),
    { preserveSymlinks },
    { throwOnUnresolvedImport: true },
  );
}
