import { Plugin, RollupOptions, RollupWarning } from 'rollup';

import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import html from '@web/rollup-plugin-html';
import polyfillsLoader from '@web/rollup-plugin-polyfills-loader';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import { terser } from 'rollup-plugin-terser';
import { mdxPlugin } from './mdxPlugin';
import { mdjsPlugin } from './mdjsPlugin';
import { injectExportsOrderPlugin } from './injectExportsOrderPlugin';

const prebuiltDir = require
  .resolve('@web/storybook-prebuilt/package.json')
  .replace('/package.json', '');

const ignoredWarnings = ['EVAL', 'THIS_IS_UNDEFINED'];

function onwarn(warning: RollupWarning, warn: (msg: RollupWarning) => void) {
  if (ignoredWarnings.includes(warning.code!)) {
    return;
  }
  warn(warning);
}

interface CreateRollupConfigParams {
  type: string;
  outputDir: string;
  indexFilename: string;
  indexHtmlString: string;
  storyFilePaths?: string[];
}

export function createRollupConfig(params: CreateRollupConfigParams): RollupOptions {
  const { outputDir, indexFilename, indexHtmlString, storyFilePaths } = params;

  const options: RollupOptions = {
    preserveEntrySignatures: false,
    onwarn,
    output: {
      entryFileNames: '[hash].js',
      chunkFileNames: '[hash].js',
      assetFileNames: '[hash][extname]',
      format: 'system',
      dir: outputDir,
    },
    plugins: [
      resolve({
        moduleDirectories: ['node_modules', 'web_modules'],
      }),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        configFile: false,
        extensions: [...DEFAULT_EXTENSIONS, 'md', 'mdx'],
        exclude: `${prebuiltDir}/**`,
        presets: [
          [
            require.resolve('@babel/preset-env'),
            {
              targets: [
                'last 3 Chrome major versions',
                'last 3 ChromeAndroid major versions',
                'last 3 Firefox major versions',
                'last 3 Edge major versions',
                'last 3 Safari major versions',
                'last 3 iOS major versions',
                'ie 11',
              ],
              useBuiltIns: false,
              shippedProposals: true,
              modules: false,
              bugfixes: true,
            },
          ],
        ],
        plugins: [
          [require.resolve('babel-plugin-bundled-import-meta'), { importStyle: 'baseURI' }],
          [
            require.resolve('babel-plugin-template-html-minifier'),
            {
              modules: {
                // this is web component specific, but has no effect on other project styles
                'lit-html': ['html'],
                'lit-element': ['html', { name: 'css', encapsulation: 'style' }],
                '@web/storybook-prebuilt/web-components': [
                  'html',
                  { name: 'css', encapsulation: 'style' },
                ],
                '@web/storybook-prebuilt/web-components.js': [
                  'html',
                  { name: 'css', encapsulation: 'style' },
                ],
                '@open-wc/testing': ['html', { name: 'css', encapsulation: 'style' }],
                '@open-wc/testing-helpers': ['html', { name: 'css', encapsulation: 'style' }],
              },
              logOnError: true,
              failOnError: false,
              strictCSS: true,
              htmlMinifier: {
                collapseWhitespace: true,
                conservativeCollapse: true,
                removeComments: true,
                caseSensitive: true,
                minifyCSS: true,
              },
            },
          ],
        ],
      }) as Plugin,
      html({ input: { name: indexFilename, html: indexHtmlString } }) as Plugin,
      polyfillsLoader({
        polyfills: {
          coreJs: true,
          fetch: true,
          abortController: true,
          regeneratorRuntime: 'always',
          webcomponents: true,
          intersectionObserver: true,
          resizeObserver: true,
        },
      }) as Plugin,
      terser({ format: { comments: false } }) as Plugin,
    ],
  };

  if (storyFilePaths && storyFilePaths.length > 0) {
    // plugins we need to inject only in the preview
    options.plugins!.unshift(injectExportsOrderPlugin(storyFilePaths));
    options.plugins!.unshift(mdxPlugin());
    options.plugins!.unshift(mdjsPlugin(params.type));
  }

  return options;
}
