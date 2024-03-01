import { stringifyProcessEnvs } from '@storybook/core-common';
import { build } from 'esbuild';
import { join } from 'path';
import type { Plugin } from 'rollup';
import { esbuildPluginCommonjsNamedExports } from './esbuild-plugin-commonjs-named-exports.js';
import { getNodeModuleDir } from './get-node-module-dir.js';

export const PREBUNDLED_MODULES_DIR = 'node_modules/.prebundled_modules';

export function rollupPluginPrebundleModules(env: Record<string, string>): Plugin {
  const modulePaths: Record<string, string> = {};

  return {
    name: 'rollup-plugin-prebundle-modules',

    async buildStart() {
      const esbuildPluginCommonjs = (await import('@chialab/esbuild-plugin-commonjs')).default; // for CJS compatibility

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
        plugins: [
          /* for @storybook/addon-docs */
          // tocbot can't be automatically transformed by @chialab/esbuild-plugin-commonjs
          // so we need a manual wrapper
          esbuildPluginCommonjsNamedExports('tocbot', ['init', 'destroy']),

          esbuildPluginCommonjs(),
        ],
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
  /* for different packages */
  'tiny-invariant',

  /* for @storybook/addon-interactions */
  'jest-mock',
  // @testing-library has ESM, but imports/exports are not working correctly between packages
  // specifically "@testing-library/user-event" has "dist/esm/utils/misc/getWindow.js" (see https://cdn.jsdelivr.net/npm/@testing-library/user-event@14.4.3/dist/esm/utils/misc/getWindow.js)
  // which uses "@testing-library/dom" in `import { getWindowFromNode } from '@testing-library/dom/dist/helpers.js';`
  // which doesn't get resolved to "@testing-library/dom" ESM "dom.esm.js" (see https://cdn.jsdelivr.net/npm/@testing-library/dom@9.3.1/dist/@testing-library/dom.esm.js)
  // and instead gets resolved to "@testing-library/dom" CommonJS "dist/helpers.js" (see https://cdn.jsdelivr.net/npm/@testing-library/dom@9.3.1/dist/helpers.js)
  '@testing-library/dom',
  '@testing-library/user-event',

  /* for @storybook/addon-docs */
  'color-convert',
  'doctrine',
  'lodash/cloneDeep.js',
  'lodash/mapValues.js',
  'lodash/pickBy.js',
  'lodash/throttle.js',
  'lodash/uniq.js',
  'memoizerific',
  'react',
  'react-dom',
  'tocbot',
];
