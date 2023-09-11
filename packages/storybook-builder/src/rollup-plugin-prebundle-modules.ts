import { stringifyProcessEnvs } from '@storybook/core-common';
import { build } from 'esbuild';
import { join } from 'path';
import type { Plugin } from 'rollup';
import { getNodeModuleDir } from './get-node-module-dir';

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

// taken from https://github.com/storybookjs/storybook/blob/v7.0.9/code/lib/builder-vite/src/optimizeDeps.ts#L7
export const CANDIDATES = [
  '@base2/pretty-print-object',
  '@emotion/core',
  '@emotion/is-prop-valid',
  '@emotion/styled',
  '@mdx-js/react',
  '@storybook/addon-docs > acorn-jsx',
  '@storybook/addon-docs',
  '@storybook/addon-essentials/docs/mdx-react-shim',
  '@storybook/channel-postmessage',
  '@storybook/channel-websocket',
  '@storybook/client-api',
  '@storybook/client-logger',
  '@storybook/core/client',
  '@storybook/global',
  '@storybook/preview-api',
  '@storybook/preview-web',
  '@storybook/react > acorn-jsx',
  '@storybook/react',
  '@storybook/svelte',
  '@storybook/types',
  '@storybook/vue3',
  'acorn-jsx',
  'acorn-walk',
  'acorn',
  'airbnb-js-shims',
  'ansi-to-html',
  'axe-core',
  'color-convert',
  'deep-object-diff',
  'doctrine',
  'emotion-theming',
  'escodegen',
  'estraverse',
  'fast-deep-equal',
  'html-tags',
  'isobject',
  'jest-mock',
  'loader-utils',
  'lodash/camelCase.js',
  'lodash/camelCase',
  'lodash/cloneDeep.js',
  'lodash/cloneDeep',
  'lodash/countBy.js',
  'lodash/countBy',
  'lodash/debounce.js',
  'lodash/debounce',
  'lodash/isEqual.js',
  'lodash/isEqual',
  'lodash/isFunction.js',
  'lodash/isFunction',
  'lodash/isPlainObject.js',
  'lodash/isPlainObject',
  'lodash/isString.js',
  'lodash/isString',
  'lodash/kebabCase.js',
  'lodash/kebabCase',
  'lodash/mapKeys.js',
  'lodash/mapKeys',
  'lodash/mapValues.js',
  'lodash/mapValues',
  'lodash/merge.js',
  'lodash/merge',
  'lodash/mergeWith.js',
  'lodash/mergeWith',
  'lodash/pick.js',
  'lodash/pick',
  'lodash/pickBy.js',
  'lodash/pickBy',
  'lodash/startCase.js',
  'lodash/startCase',
  'lodash/throttle.js',
  'lodash/throttle',
  'lodash/uniq.js',
  'lodash/uniq',
  'lodash/upperFirst.js',
  'lodash/upperFirst',
  'markdown-to-jsx',
  'memoizerific',
  'overlayscrollbars',
  'polished',
  'prettier/parser-babel',
  'prettier/parser-flow',
  'prettier/parser-typescript',
  'prop-types',
  'qs',
  'react-dom',
  'react-dom/client',
  'react-fast-compare',
  'react-is',
  'react-textarea-autosize',
  'react',
  'react/jsx-runtime',
  'refractor/core',
  'refractor/lang/bash.js',
  'refractor/lang/css.js',
  'refractor/lang/graphql.js',
  'refractor/lang/js-extras.js',
  'refractor/lang/json.js',
  'refractor/lang/jsx.js',
  'refractor/lang/markdown.js',
  'refractor/lang/markup.js',
  'refractor/lang/tsx.js',
  'refractor/lang/typescript.js',
  'refractor/lang/yaml.js',
  'regenerator-runtime/runtime.js',
  'slash',
  'store2',
  'synchronous-promise',
  'telejson',
  'ts-dedent',
  'unfetch',
  'util-deprecate',
  'vue',
  'warning',
];

// we need more, probably Vite in builder-vite transforms those on the fly
CANDIDATES.push(
  '@testing-library/user-event',
  'aria-query',
  'lz-string',
  'pretty-format',
  'tiny-invariant',
);
