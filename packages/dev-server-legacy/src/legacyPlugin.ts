import { Plugin, Logger, getRequestFilePath, isInlineScriptRequest } from '@web/dev-server-core';
import { GeneratedFile, PolyfillsConfig } from '@web/polyfills-loader';
import path from 'path';
import { isLegacyBrowser } from './isLegacyBrowser';
import { babelTransform, es5Config, systemJsConfig } from './babelTransform';
import { injectPolyfillsLoader } from './injectPolyfillsLoader';
import { PARAM_TRANSFORM_SYSTEMJS } from './constants';

interface inlineScripts {
  lastModified: string;
  inlineScripts: GeneratedFile[];
}

const REGEXP_TO_BROWSER_PATH = new RegExp(path.sep === '\\' ? '\\\\' : path.sep, 'g');

/**
 * Turns a file path into a path suitable for browsers, with a / as seperator.
 * @param {string} filePath
 * @returns {string}
 */
function toBrowserPath(filePath: string) {
  return filePath.replace(REGEXP_TO_BROWSER_PATH, '/');
}

export interface LegacyPluginOptions {
  polyfills?: PolyfillsConfig;
}

export function legacyPlugin(options: LegacyPluginOptions = {}): Plugin {
  // index html data, keyed by url
  const inlineScripts = new Map<string, inlineScripts>();
  // polyfills, keyed by request path
  const polyfills = new Map<string, string>();
  let rootDir: string;
  let logger: Logger;

  return {
    name: 'legacy',

    async serverStart(args) {
      ({ logger } = args);
      ({ rootDir } = args.config);
    },

    transformCacheKey(context) {
      return isLegacyBrowser(context, logger) ? 'legacy' : undefined;
    },

    async serve(context) {
      if (!isLegacyBrowser(context, logger)) {
        return;
      }

      /**
       * serve extracted inline module if url matches. an inline module requests has this
       * structure:
       * `/inline-script-<index>?source=<index-html-path>`
       * for example:
       * `/inline-script-2?source=/src/index-html`
       * source query parameter is the index.html the inline module came from, index is the index
       * of the inline module in that index.html. We use these to look up the correct code to
       * serve
       */
      if (isInlineScriptRequest(context.url)) {
        const sourcePath = context.URL.searchParams.get('source');
        if (!sourcePath) {
          throw new Error(`${context.url} is missing a source param`);
        }

        const data = inlineScripts.get(sourcePath);
        if (!data) {
          return undefined;
        }

        const name = path.basename(context.path);
        const inlineScript = data.inlineScripts.find(f => f.path.split('?')[0] === name);
        if (!inlineScript) {
          throw new Error(`Could not find inline module for ${context.url}`);
        }

        return {
          body: inlineScript.content,
          headers: {
            'cache-control': 'no-cache',
            'last-modified': data.lastModified,
          } as Record<string, string>,
        };
      }

      // serve polyfill from memory if path matches
      const polyfill = polyfills.get(context.path);
      if (polyfill) {
        // aggresively cache polyfills, they are hashed so content changes bust the cache
        return { body: polyfill, headers: { 'cache-control': 'public, max-age=31536000' } };
      }
    },

    async transform(context) {
      if (!isLegacyBrowser(context, logger)) {
        return;
      }

      if (context.response.is('js')) {
        if (context.path.includes('/polyfills/')) {
          return;
        }
        const config =
          context.URL.searchParams.get(PARAM_TRANSFORM_SYSTEMJS) === 'true'
            ? systemJsConfig
            : es5Config;
        const filePath = getRequestFilePath(context.url, rootDir);
        const transformed = await babelTransform(filePath, context.body as string, config);
        context.body = transformed;
        return;
      }

      if (context.response.is('html')) {
        const result = await injectPolyfillsLoader(context, options.polyfills);
        context.body = result.indexHTML;

        inlineScripts.set(result.htmlPath, {
          ...result,
          inlineScripts: result.inlineScripts,
          lastModified: context.response.headers['last-modified'] as string,
        });

        // cache polyfills for serving
        result.polyfills.forEach(p => {
          let root = context.path.endsWith('/') ? context.path : path.posix.dirname(context.path);
          if (!root.endsWith('/')) {
            root = `${root}/`;
          }
          polyfills.set(`${root}${toBrowserPath(p.path)}`, p.content);
        });
      }
    },

    transformImport({ source, context }) {
      if (!isLegacyBrowser(context, logger)) {
        return;
      }

      const prefix = source.includes('?') ? '&' : '?';
      return `${source}${prefix}${PARAM_TRANSFORM_SYSTEMJS}=true`;
    },
  };
}

export default legacyPlugin;
