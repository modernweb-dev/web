import type { Plugin } from 'esbuild';

export function esbuildPluginCommonjsNamedExports(module: string, namedExports: string[]): Plugin {
  return {
    name: 'commonjs-named-exports',
    setup(build) {
      build.onResolve({ filter: new RegExp(`^${module}$`) }, args => {
        return {
          path: args.path,
          namespace: `commonjs-named-exports-${module}`,
          pluginData: {
            resolveDir: args.resolveDir,
          },
        };
      });
      build.onLoad({ filter: /.*/, namespace: `commonjs-named-exports-${module}` }, async args => {
        return {
          resolveDir: args.pluginData.resolveDir,
          contents: `
            import { default as commonjsExports } from '${module}?force-original';
            ${namedExports
              .map(name => `export const ${name} = commonjsExports.${name};`)
              .join('\n')}
          `,
        };
      });
    },
  };
}
