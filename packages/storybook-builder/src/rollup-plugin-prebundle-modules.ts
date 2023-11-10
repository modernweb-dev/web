import { stringifyProcessEnvs } from '@storybook/core-common';
import { build } from 'esbuild';
import { join } from 'path';
import type { Plugin } from 'rollup';
import { getNodeModuleDir } from './get-node-module-dir.js';

export const PREBUNDLED_MODULES_DIR = 'node_modules/.prebundled_modules';

export function rollupPluginPrebundleModules(env: Record<string, string>): Plugin {
  const modulePaths: Record<string, string> = {};

  return {
    name: 'rollup-plugin-prebundle-modules',

    async buildStart() {
      const esbuildCommonjsPlugin = (await import('@chialab/esbuild-plugin-commonjs')).default; // for CJS compatibility

      const modules = getModules();

      for (const module of modules) {
        modulePaths[module] = join(
          process.cwd(),
          PREBUNDLED_MODULES_DIR,
          module.endsWith('.js') ? module : `${module}.js`,
        );
      }

      await build({
        entryPoints: modules,
        outdir: PREBUNDLED_MODULES_DIR,
        bundle: true,
        format: 'esm',
        splitting: true,
        sourcemap: true,
        alias: {
          assert: require.resolve('browser-assert'),
          lodash: getNodeModuleDir('lodash-es'), // more optimal, but also solves esbuild incorrectly compiling lodash/_nodeUtil
          path: require.resolve('path-browserify'),
        },
        define: {
          ...stringifyProcessEnvs(env),
        },
        plugins: [esbuildCommonjsPlugin()],
      });
    },

    async resolveId(source) {
      return modulePaths[source];
    },
  };
}

function getModules() {
  const include = CANDIDATES.filter(id => {
    try {
      require.resolve(id, { paths: [process.cwd()] });
      return true;
    } catch (e) {
      return false;
    }
  });
  return include;
}

// this is different to https://github.com/storybookjs/storybook/blob/v7.0.0/code/lib/builder-vite/src/optimizeDeps.ts#L7
// builder-vite bundles different dependencies for performance reasons
// we aim only at browserifying NodeJS dependencies (CommonJS/process.env/...)
export const CANDIDATES = [
  // @testing-library has ESM, but imports/exports are not working correctly between packages
  // specifically "@testing-library/user-event" has "dist/esm/utils/misc/getWindow.js" (see https://cdn.jsdelivr.net/npm/@testing-library/user-event@14.4.3/dist/esm/utils/misc/getWindow.js)
  // which uses "@testing-library/dom" in `import { getWindowFromNode } from '@testing-library/dom/dist/helpers.js';`
  // which doesn't get resolved to "@testing-library/dom" ESM "dom.esm.js" (see https://cdn.jsdelivr.net/npm/@testing-library/dom@9.3.1/dist/@testing-library/dom.esm.js)
  // and instead gets resolved to "@testing-library/dom" CommonJS "dist/helpers.js" (see https://cdn.jsdelivr.net/npm/@testing-library/dom@9.3.1/dist/helpers.js)
  '@testing-library/dom',
  '@testing-library/user-event',

  // CommonJS module used in Storybook MJS files
  'doctrine',

  // CommonJS module used in Storybook MJS files
  'jest-mock',

  // CommonJS module used in Storybook MJS files
  'lodash/mapValues.js',

  // ESM, but uses `process.env.NODE_ENV`
  'tiny-invariant',
];
