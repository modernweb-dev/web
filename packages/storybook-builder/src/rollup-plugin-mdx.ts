import type { Options } from 'storybook/internal/types';
import { readFile } from 'node:fs/promises';
import { dirname, join, sep } from 'node:path';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import type { Plugin } from 'rollup';

export function rollupPluginMdx(options: Options): Plugin {
  let mdxPluginOptions: Record<string, any>;
  let jsxOptions: Record<string, any>;

  return {
    name: 'rollup-plugin-mdx',

    async buildStart() {
      ({ mdxPluginOptions, jsxOptions } = await options.presets.apply<Record<string, any>>(
        'options',
        {},
      ));
    },

    async resolveId(id) {
      if (id.endsWith('.mdx.js')) {
        return id;
      }
    },

    async load(id: string) {
      if (!id.endsWith('.mdx.js')) return;

      const mdxPath = id.replace(/\.js$/, '');
      const mdxCode = await readFile(mdxPath.split('/').join(sep), { encoding: 'utf8' });

      const mdxLoaderOptions = await options.presets.apply('mdxLoaderOptions', {
        ...mdxPluginOptions,
        mdxCompileOptions: {
          // this is done by Storybook in addon-docs in 2 different places:
          // 1. in vite plugin (not run for our builder)
          // 2. in webpack loader (not run for our builder)
          // so we need to duplicate same logic here
          providerImportSource: join(
            dirname(require.resolve('@storybook/addon-docs/package.json')),
            '/dist/shims/mdx-react-shim.mjs',
          ),
          ...mdxPluginOptions?.mdxCompileOptions,
          rehypePlugins: [
            ...(mdxPluginOptions?.mdxCompileOptions?.rehypePlugins ?? []),
            rehypeSlug,
            rehypeExternalLinks,
          ],
        },
        jsxOptions,
      });

      const { compile } = await import('@mdx-js/mdx'); // for CJS compatibility
      const mdxResult = await compile(mdxCode, mdxLoaderOptions.mdxCompileOptions);

      return mdxResult.toString();
    },
  };
}
