import { RollupPluginHtml } from '@web/rollup-plugin-html';
import { Plugin } from 'rollup';
import { GeneratedFile, injectPolyfillsLoader, File, fileTypes } from '@web/polyfills-loader';
import path from 'path';

import { RollupPluginPolyfillsLoaderConfig } from './types';
import { createError, shouldInjectLoader } from './utils.js';
import { createPolyfillsLoaderConfig, formatToFileType } from './createPolyfillsLoaderConfig.js';

export function polyfillsLoader(pluginOptions: RollupPluginPolyfillsLoaderConfig = {}): Plugin {
  let generatedFiles: GeneratedFile[] | undefined;

  return {
    name: '@web/rollup-plugin-polyfills-loader',

    buildStart(options) {
      generatedFiles = undefined;
      if (!options.plugins) {
        throw createError('Could not find any installed plugins');
      }

      const htmlPlugins = options.plugins.filter(
        p => p.name === '@web/rollup-plugin-html',
      ) as RollupPluginHtml[];
      const [htmlPlugin] = htmlPlugins;

      if (!htmlPlugin) {
        throw createError(
          'Could not find any instance of @web/rollup-plugin-html in rollup build.',
        );
      }

      htmlPlugin.api.disableDefaultInject();
      htmlPlugin.api.addHtmlTransformer(async (html, { bundle, bundles, htmlFileName }) => {
        const config = createPolyfillsLoaderConfig(pluginOptions, bundle, bundles);
        const relativePathToPolyfills = path.relative(
          path.dirname(htmlFileName),
          path.dirname(pluginOptions.polyfillsDir || './polyfills'),
        );
        let htmlString = html;

        if (shouldInjectLoader(config)) {
          const result = await injectPolyfillsLoader(html, { ...config, relativePathToPolyfills });
          htmlString = result.htmlString;
          generatedFiles = result.polyfillFiles;
        } else {
          // we don't need to inject a polyfills loader, so we just inject the scripts directly
          const scripts = config
            .modern!.files.map((f: File) => {
              let attributes = '';
              if (f.attributes && f.attributes.length > 0) {
                attributes = ' ';
                attributes += f.attributes
                  .map(attribute => `${attribute.name}="${attribute.value}"`)
                  .join(' ');
              }
              return `<script type="module" src="${f.path}"${attributes}></script>\n`;
            })
            .join('');
          htmlString = htmlString.replace('</body>', `\n${scripts}\n</body>`);
        }

        // preload all entrypoints as well as their direct dependencies
        const { entrypoints } =
          pluginOptions.legacyOutput && pluginOptions.modernOutput
            ? bundles[pluginOptions.modernOutput.name]
            : bundle;

        let preloaded = [];
        function normalize(path: string) {
          if (path.startsWith('../')) {
            return path;
          } else if (path.startsWith('./')) {
            return path;
          } else if (path.startsWith('http')) {
            return path;
          } else if (path.startsWith('/')) {
            return '.' + path;
          } else {
            return './' + path;
          }
        }

        for (const entrypoint of entrypoints) {
          const importPath = normalize(path.posix.relative('', entrypoint.importPath));
          preloaded.push(importPath);

          // js files (incl. chunks) will always be in the root directory
          const pathToRoot = path.posix.dirname(importPath);
          for (const chunkPath of entrypoint.chunk.imports) {
            const relativeChunkPath = normalize(path.posix.join(pathToRoot, chunkPath));
            preloaded.push(relativeChunkPath);
          }
        }

        preloaded = [...new Set(preloaded)];

        const type =
          pluginOptions.modernOutput?.type ?? formatToFileType(bundle?.options.format ?? 'esm');
        const crossorigin = type === fileTypes.MODULE ? ' crossorigin="anonymous"' : '';
        const shim = type === fileTypes.MODULESHIM;
        const rel = `${shim ? 'module' : ''}preload${shim ? '-shim' : ''}`;
        const as = shim ? '' : ' as="script"';
        return htmlString.replace(
          '</head>',
          `\n${preloaded
            .map(i => `<link rel="${rel}" href="${i}"${as}${crossorigin} />\n`)
            .join('')}</head>`,
        );
      });
    },

    generateBundle(_, bundle) {
      if (generatedFiles) {
        for (const file of generatedFiles) {
          // if the polyfills loader is used multiple times, this polyfill might already be output
          // so we guard against that. polyfills are already hashed, so there is no need to worry
          // about clashing
          if (!(file.path in bundle)) {
            this.emitFile({
              type: 'asset',
              name: file.path,
              fileName: file.path,
              source: file.content,
            });
          }
        }
      }
    },
  };
}
