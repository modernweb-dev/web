import type { Plugin } from 'esbuild';
import { readFile } from 'fs-extra';
import { dirname, relative } from 'path';

export function esbuildPluginCommonjsNamedExports(modules: string[]): Plugin {
  return {
    name: 'commonjs-named-exports',
    async setup(build) {
      const slash = (await import('slash')).default;

      const { init, parse } = await import('cjs-module-lexer');
      await init();

      build.onResolve({ filter: new RegExp(`^(${modules.join('|')})$`) }, async args => {
        if (args.pluginData?.preventInfiniteRecursion) return;

        const { path, ...rest } = args;
        rest.pluginData = { preventInfiniteRecursion: true };
        const resolveResult = await build.resolve(path, rest);
        const resolvedPath = resolveResult.path;

        // skip if resolved to an ESM file
        if (resolvedPath.endsWith('.mjs')) return;

        const namedExports = await getNamedExports(resolvedPath);

        // skip if nothing is exported
        // (or was an ESM file with .js extension or just failed)
        if (namedExports.length === 0) return;

        return {
          path: args.path,
          namespace: 'commonjs-named-exports',
          pluginData: {
            resolveDir: args.resolveDir,
            resolvedPath,
            namedExports,
          },
        };
      });

      build.onLoad({ filter: /.*/, namespace: `commonjs-named-exports` }, async args => {
        const { resolveDir, resolvedPath, namedExports } = args.pluginData;

        const filteredNamedExports = namedExports.filter((name: string) => {
          return (
            // interop for "default" export heavily relies on the esbuild work done automatically
            // we just always reexport it
            // but we need to filter it out here to prevent double reexport if "default" was identified by the lexer
            name !== 'default' &&
            // we don't need "__esModule" flag in this wrapper
            // because it outputs native ESM which will be consumed by other native ESM in the browser
            name !== '__esModule'
          );
        });

        const finalExports = ['default', ...filteredNamedExports];

        return {
          resolveDir,
          contents: `export { ${finalExports.join(',')} } from './${slash(
            relative(resolveDir, resolvedPath),
          )}';`,
        };
      });

      async function getNamedExports(path: string): Promise<string[]> {
        const source = await readFile(path, 'utf8');

        let exports: string[] = [];
        let reexports: string[] = [];
        try {
          ({ exports, reexports } = parse(source));
        } catch (e) {
          // good place to start debugging if imports are not working
        }

        for (const reexport of reexports) {
          const reexportPath = require.resolve(reexport, { paths: [dirname(path)] });
          const deepExports = await getNamedExports(reexportPath);
          for (const deepExport of deepExports) {
            exports.push(deepExport);
          }
        }

        return exports;
      }
    },
  };
}
