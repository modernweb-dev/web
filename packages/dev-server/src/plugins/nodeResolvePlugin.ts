import { nodeResolve, rollupAdapter, RollupNodeResolveOptions } from '@web/dev-server-rollup';
import { Plugin } from '@web/dev-server-core';
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
      exportConditions: ['development'],
    },
    userOptionsObject,
  );

  return rollupAdapter(
    nodeResolve(options),
    { preserveSymlinks },
    { throwOnUnresolvedImport: true },
  );
}
