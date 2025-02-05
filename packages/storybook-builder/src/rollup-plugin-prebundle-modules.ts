import type { Options } from '@storybook/types';
import { build } from 'esbuild';
import { rm, readFile } from 'node:fs/promises';
import { join, normalize, isAbsolute, dirname } from 'node:path';
import type { Plugin } from 'rollup';
import { esbuildPluginCommonjsNamedExports } from './esbuild-plugin-commonjs-named-exports.js';
import { stringifyProcessEnvs } from './stringify-process-envs.js';

export const PREBUNDLED_MODULES_DIR = normalize('node_modules/.prebundled_modules');

export function rollupPluginPrebundleModules(
  env: Record<string, string>,
  options: Options,
): Plugin {
  const modulePaths: Record<string, string> = {};

  return {
    name: 'rollup-plugin-prebundle-modules',

    async buildStart() {
      const modules = CANDIDATES.filter(moduleExists);

      const modulesDir = join(process.cwd(), PREBUNDLED_MODULES_DIR);
      await rm(modulesDir, { recursive: true, force: true });

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
          /* for @storybook/addon-docs */
          ...(moduleExists('@storybook/react-dom-shim') && {
            '@storybook/react-dom-shim': await getReactDomShimAlias(options),
          }),
        },
        external: [...modules],
        define: stringifyProcessEnvs(env),
        plugins: [esbuildPluginCommonjsNamedExports(modules)],
      });
    },

    async resolveId(source) {
      return modulePaths[source];
    },
  };
}

// this is different to https://github.com/storybookjs/storybook/blob/v8.5.0/code/builders/builder-vite/src/optimizeDeps.ts
// builder-vite bundles different dependencies for performance reasons
// we aim only at browserifying NodeJS dependencies (CommonJS/process.env/...)
export const CANDIDATES = [
  /* for different addons built with React and for MDX */
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  'react-dom/client',

  /* for different packages */
  'memoizerific',
  'tiny-invariant',

  /* for @storybook/core */
  'jsdoc-type-pratt-parser', // TODO: Remove this once it's converted to ESM: https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/173

  /* for @storybook/addon-a11y */
  'axe-core',
  'vitest-axe/matchers',

  /* for @storybook/addon-docs */
  'color-convert',
];

function moduleExists(moduleName: string) {
  try {
    require.resolve(moduleName, { paths: [process.cwd()] });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get react-dom version from the resolvedReact preset, which points to either a root react-dom
 * dependency or the react-dom dependency shipped with addon-docs
 */
async function getIsReactVersion18or19(options: Options) {
  const { legacyRootApi } =
    (await options.presets.apply<{ legacyRootApi?: boolean } | null>('frameworkOptions')) || {};

  if (legacyRootApi) {
    return false;
  }

  const resolvedReact = await options.presets.apply<{ reactDom?: string }>('resolvedReact', {});
  const reactDom = resolvedReact.reactDom || dirname(require.resolve('react-dom/package.json'));

  if (!isAbsolute(reactDom)) {
    // if react-dom is not resolved to a file we can't be sure if the version in package.json is correct or even if package.json exists
    // this happens when react-dom is resolved to 'preact/compat' for example
    return false;
  }

  const { version } = JSON.parse(await readFile(join(reactDom, 'package.json'), 'utf-8'));
  return version.startsWith('18') || version.startsWith('19') || version.startsWith('0.0.0');
}

async function getReactDomShimAlias(options: Options) {
  return (await getIsReactVersion18or19(options))
    ? require.resolve('@storybook/react-dom-shim')
    : require.resolve('@storybook/react-dom-shim/dist/react-16');
}
