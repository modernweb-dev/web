import { stringifyProcessEnvs } from '@storybook/core-common';
import { build } from 'esbuild';
import { remove } from 'fs-extra';
import { join, normalize } from 'path';
import type { Plugin } from 'rollup';
import { esbuildPluginCommonjsNamedExports } from './esbuild-plugin-commonjs-named-exports.js';
import { getNodeModuleDir } from './get-node-module-dir.js';

export const PREBUNDLED_MODULES_DIR = normalize('node_modules/.prebundled_modules');

export function rollupPluginPrebundleModules(env: Record<string, string>): Plugin {
  const modulePaths: Record<string, string> = {};

  return {
    name: 'rollup-plugin-prebundle-modules',

    async buildStart() {
      const modules = CANDIDATES.filter(moduleExists);

      const modulesDir = join(process.cwd(), PREBUNDLED_MODULES_DIR);
      await remove(modulesDir);

      for (const module of modules) {
        modulePaths[module] = join(
          modulesDir,
          module.endsWith('.js') ? module.replace(/\.js$/, '.mjs') : `${module}.mjs`,
        );
      }

      await build({
        entryPoints: modules,
        outdir: PREBUNDLED_MODULES_DIR,
        outExtension: { '.js': '.mjs' },
        bundle: true,
        format: 'esm',
        splitting: true,
        sourcemap: true,
        alias: {
          assert: require.resolve('browser-assert'),
          lodash: getNodeModuleDir('lodash-es'), // more optimal, but also solves esbuild incorrectly compiling lodash/_nodeUtil
          path: require.resolve('path-browserify'),

          /* for @storybook/addon-docs */
          ...(moduleExists('@storybook/react-dom-shim') && {
            '@storybook/react-dom-shim': getReactDomShimAlias(),
          }),
        },
        define: (() => {
          const define = stringifyProcessEnvs(env);

          // "NODE_PATH" pollutes the output, it's not used by prebundled modules and is not recommended in general
          // see more https://github.com/nodejs/node/issues/38128#issuecomment-814969356
          delete define['process.env.NODE_PATH'];

          return define;
        })(),
        plugins: [
          esbuildPluginCommonjsNamedExports(
            modules.filter(
              module =>
                // lodash is solved by the lodash-es alias
                !module.startsWith('lodash/') &&
                // @storybook/react-dom-shim is just an alias to an ESM module
                module !== '@storybook/react-dom-shim',
            ),
          ),
        ],
      });
    },

    async resolveId(source) {
      return modulePaths[source];
    },
  };
}

// this is different to https://github.com/storybookjs/storybook/blob/v7.0.0/code/lib/builder-vite/src/optimizeDeps.ts#L7
// builder-vite bundles different dependencies for performance reasons
// we aim only at browserifying NodeJS dependencies (CommonJS/process.env/...)
export const CANDIDATES = [
  /* for different addons built with React and for MDX */
  '@storybook/react-dom-shim', // needs special resolution
  'react',
  process.env.NODE_ENV === 'production' ? 'react/jsx-runtime' : 'react/jsx-dev-runtime',
  'react-dom',

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
  'tocbot',

  /* for @storybook/addon-a11y */
  'axe-core',
];

function getReactDomShimAlias() {
  const { version } = require('react-dom');
  return version.startsWith('18')
    ? require.resolve('@storybook/react-dom-shim/dist/react-18').replace(/\.js$/, '.mjs')
    : require.resolve('@storybook/react-dom-shim').replace(/\.js$/, '.mjs');
}

function moduleExists(moduleName: string) {
  try {
    require.resolve(moduleName, { paths: [process.cwd()] });
    return true;
  } catch (e) {
    return false;
  }
}
