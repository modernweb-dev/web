import { fromRollup } from '@web/dev-server-rollup';
import rollupNodeResolve, { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import deepmerge from 'deepmerge';

export function nodeResolvePlugin(
  rootDir: string,
  preserveSymlinks?: boolean,
  userOptions?: RollupNodeResolveOptions,
) {
  const nodeResolve = fromRollup(rollupNodeResolve, { preserveSymlinks });
  const userOptionsObject = typeof userOptions === 'object' ? userOptions : {};
  const options: RollupNodeResolveOptions = deepmerge(
    {
      rootDir,
      extensions: ['.mjs', '.js', '.cjs', '.jsx', '.json', '.ts', '.tsx'],
      customResolveOptions: {
        moduleDirectory: ['node_modules', 'web_modules'],
      },
      // allow resolving polyfills for nodejs libs
      preferBuiltins: false,
    },
    userOptionsObject,
  );

  return nodeResolve(options);
}
