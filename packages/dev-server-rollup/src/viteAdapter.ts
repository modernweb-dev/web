/* eslint-disable no-control-regex */
import path from 'path';
import whatwgUrl from 'whatwg-url';
import {
  Plugin as WdsPlugin,
  DevServerCoreConfig,
  FSWatcher,
  PluginError,
  PluginSyntaxError,
  Context,
  getRequestFilePath,
} from '@web/dev-server-core';
import {
  queryAll,
  predicates,
  getTextContent,
  setTextContent,
} from '@web/dev-server-core/dist/dom5';
import { parse as parseHtml, serialize as serializeHtml } from 'parse5';
import { CustomPluginOptions, Plugin as RollupPlugin, TransformPluginContext } from 'rollup';
import { cyan, red } from 'nanocolors';

import { toBrowserPath, isAbsoluteFilePath, isOutsideRootDir } from './utils.js';
import { createRollupPluginContextAdapter } from './createRollupPluginContextAdapter.js';
import { createRollupPluginContexts, RollupPluginContexts } from './createRollupPluginContexts.js';
import { RollupAdapterOptions } from './rollupAdapter.js';

const NULL_BYTE_PARAM = 'web-dev-server-rollup-null-byte';
const VIRTUAL_FILE_PREFIX = '/__web-dev-server__/rollup';
const WDS_FILE_PREFIX = '/__web-dev-server__';
const OUTSIDE_ROOT_REGEXP = /\/__wds-outside-root__\/([0-9]+)\/(.*)/;

/**
 * Minimal Vite dev server interface used by plugin hooks.
 * Only covers the subset of properties/methods that the adapter exposes.
 */
export interface ViteDevServerLike {
  middlewares: {
    use(fn: (req: unknown, res: unknown, next: () => void) => void): void;
    use(path: string, fn: (req: unknown, res: unknown, next: () => void) => void): void;
  };
  watcher: FSWatcher;
  config: {
    root: string;
    [key: string]: unknown;
  };
}

/**
 * Minimal subset of Vite-specific plugin hooks that the adapter understands.
 * Vite plugins extend Rollup plugins with these additional hooks.
 */
export interface VitePlugin extends RollupPlugin {
  /**
   * Controls when the plugin is applied. 'serve' means dev server only (default for this adapter).
   * 'build' plugins are skipped. A function can inspect config/env.
   */
  apply?: 'build' | 'serve' | ((config: unknown, env: { command: string }) => boolean);

  /**
   * Enforce plugin execution order.
   */
  enforce?: 'pre' | 'post';

  /**
   * Hook to configure the dev server. Receives a minimal Vite-like dev server object.
   * Return a function if you want it called after other `configureServer` hooks.
   */
  configureServer?(server: ViteDevServerLike): void | (() => void) | Promise<void | (() => void)>;

  /**
   * Hook to transform index.html.
   * Can return a string with the transformed HTML, an array of tag descriptors, or an object.
   */
  transformIndexHtml?(
    html: string,
    ctx: { filename: string; path: string },
  ): ViteHtmlTransformResult | Promise<ViteHtmlTransformResult>;
}

export type ViteHtmlTransformResult =
  | string
  | ViteHtmlTagDescriptor[]
  | {
      html: string;
      tags?: ViteHtmlTagDescriptor[];
    }
  | void
  | null
  | undefined;

export interface ViteHtmlTagDescriptor {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  children?: string | ViteHtmlTagDescriptor[];
  injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
}

/**
 * Wraps rollup error in a custom error for web dev server.
 */
function wrapRollupError(filePath: string, context: Context, error: unknown) {
  if (error == null || typeof error !== 'object') {
    return error;
  }
  const err = error as { message?: string; loc?: { line?: unknown; column?: unknown } };
  if (typeof err?.loc?.line === 'number' && typeof err?.loc?.column === 'number') {
    return new PluginSyntaxError(
      err.message?.replace(new RegExp(`(\\s*in\\s*)?(${filePath})`), '') ?? '',
      filePath,
      context.body as string,
      err.loc.line as number,
      err.loc.column as number,
    );
  }
  return error;
}

/**
 * Serialize a ViteHtmlTagDescriptor to an HTML string.
 */
function serializeTag(tag: ViteHtmlTagDescriptor): string {
  const attrsStr = tag.attrs
    ? Object.entries(tag.attrs)
        .filter(([, v]) => v !== false && v !== undefined)
        .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
        .join(' ')
    : '';
  const openTag = attrsStr ? `<${tag.tag} ${attrsStr}>` : `<${tag.tag}>`;
  const voidElements = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ]);
  if (voidElements.has(tag.tag)) {
    return openTag;
  }
  let inner = '';
  if (typeof tag.children === 'string') {
    inner = tag.children;
  } else if (Array.isArray(tag.children)) {
    inner = tag.children.map(serializeTag).join('');
  }
  return `${openTag}${inner}</${tag.tag}>`;
}

/**
 * Apply transformIndexHtml tags to an HTML string.
 * Falls back to inserting before </body> when </head> is absent, and
 * appends to the end when </body> is also absent.
 */
function applyTagsToHtml(html: string, tags: ViteHtmlTagDescriptor[]): string {
  for (const tag of tags) {
    const inject = tag.injectTo ?? 'head';
    const serialized = serializeTag(tag);
    if (inject === 'head-prepend') {
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/(<head[^>]*>)/i, `$1${serialized}`);
      } else {
        html = serialized + html;
      }
    } else if (inject === 'head') {
      if (/<\/head>/i.test(html)) {
        html = html.replace(/<\/head>/i, `${serialized}</head>`);
      } else if (/<\/body>/i.test(html)) {
        html = html.replace(/<\/body>/i, `${serialized}</body>`);
      } else {
        html = html + serialized;
      }
    } else if (inject === 'body-prepend') {
      if (/<body[^>]*>/i.test(html)) {
        html = html.replace(/(<body[^>]*>)/i, `$1${serialized}`);
      } else {
        html = serialized + html;
      }
    } else {
      // 'body'
      if (/<\/body>/i.test(html)) {
        html = html.replace(/<\/body>/i, `${serialized}</body>`);
      } else {
        html = html + serialized;
      }
    }
  }
  return html;
}

const resolverCache = new WeakMap<Context, WeakMap<WdsPlugin, Set<string>>>();

/**
 * Adapts a Vite plugin to work as a Web Dev Server plugin.
 *
 * Supported hooks:
 * - `resolveId` — resolve module imports
 * - `load` — serve virtual/custom files
 * - `transform` — transform JS modules
 * - `configureServer` — add custom middleware
 * - `transformIndexHtml` — transform HTML files
 *
 * Vite-specific build-only hooks (`config`, `configResolved`, `handleHotUpdate`,
 * `configurePreviewServer`) are silently ignored.
 */
export function viteAdapter(
  vitePlugin: VitePlugin,
  adapterOptions: RollupAdapterOptions = {},
): WdsPlugin {
  if (typeof vitePlugin !== 'object') {
    throw new Error('viteAdapter should be called with a Vite plugin object.');
  }

  // Skip plugins that only apply during build
  const apply = vitePlugin.apply;
  if (apply === 'build') {
    return { name: vitePlugin.name };
  }
  if (typeof apply === 'function') {
    const env = { command: 'serve' };
    if (!apply({}, env)) {
      return { name: vitePlugin.name };
    }
  }

  const rollupPlugin = vitePlugin as RollupPlugin;

  const transformedFiles = new Set<string>();
  const pluginMetaPerModule = new Map<string, CustomPluginOptions>();
  let rollupPluginContexts: RollupPluginContexts;
  let fileWatcher: FSWatcher;
  let config: DevServerCoreConfig;
  let rootDir: string;
  let idResolvers: Array<Required<RollupPlugin>['resolveId']> = [];

  function savePluginMeta(
    id: string,
    { meta }: { meta?: CustomPluginOptions | null | undefined } = {},
  ) {
    if (!meta) return;
    const previousMeta = pluginMetaPerModule.get(id);
    pluginMetaPerModule.set(id, { ...previousMeta, ...meta });
  }

  const wdsPlugin: WdsPlugin = {
    name: vitePlugin.name,

    async serverStart(args) {
      ({ fileWatcher, config } = args);
      ({ rootDir } = config);
      rollupPluginContexts = await createRollupPluginContexts({});

      idResolvers = [];

      // call buildStart (Rollup-compatible)
      if (typeof rollupPlugin.buildStart === 'function') {
        await rollupPlugin.buildStart?.call(
          rollupPluginContexts.pluginContext,
          rollupPluginContexts.normalizedInputOptions,
        );
      }

      if (rollupPlugin.resolveId) {
        idResolvers.push(rollupPlugin.resolveId);
      }

      // call configureServer with a minimal Vite-like server object
      if (typeof vitePlugin.configureServer === 'function') {
        const middlewareHandlers: Array<{
          path?: string;
          fn: (req: unknown, res: unknown, next: () => void) => void;
        }> = [];

        const viteServer: ViteDevServerLike = {
          middlewares: {
            use(
              pathOrFn:
                | string
                | ((req: unknown, res: unknown, next: () => void) => void),
              maybeFn?: (req: unknown, res: unknown, next: () => void) => void,
            ) {
              if (typeof pathOrFn === 'function') {
                middlewareHandlers.push({ fn: pathOrFn });
              } else if (maybeFn) {
                middlewareHandlers.push({ path: pathOrFn, fn: maybeFn });
              }
            },
          },
          watcher: fileWatcher,
          config: {
            root: rootDir,
          },
        };

        const postHook = await vitePlugin.configureServer(viteServer);

        // Inject collected middleware into the WDS Koa app
        for (const { path: mwPath, fn } of middlewareHandlers) {
          args.app.use(async (ctx, next) => {
            if (mwPath && !ctx.path.startsWith(mwPath)) {
              return next();
            }
            await new Promise<void>((resolve, reject) => {
              fn(ctx.req, ctx.res, (err?: unknown) => {
                if (err) reject(err);
                else resolve();
              });
            });
            if (!ctx.respond) {
              return next();
            }
          });
        }

        // call the optional post-hooks (Vite calls them after internal middleware)
        if (typeof postHook === 'function') {
          await postHook();
        }
      }
    },

    resolveImportSkip(context: Context, source: string, importer: string) {
      const resolverCacheForContext =
        resolverCache.get(context) ?? new WeakMap<WdsPlugin, Set<string>>();
      resolverCache.set(context, resolverCacheForContext);
      const resolverCacheForPlugin = resolverCacheForContext.get(wdsPlugin) ?? new Set<string>();
      resolverCacheForContext.set(wdsPlugin, resolverCacheForPlugin);
      resolverCacheForPlugin.add(`${source}:${importer}`);
    },

    async resolveImport({ source, context, code, column, line, resolveOptions }) {
      if (context.response.is('html') && source.startsWith('\uFFFD')) {
        source = source.replace('\uFFFD', '\0');
      }

      const injectedFilePath = path.normalize(source).startsWith(rootDir);
      if (!injectedFilePath && idResolvers.length === 0) {
        return;
      }

      const isVirtualModule = source.startsWith('\0');
      if (
        !injectedFilePath &&
        !path.isAbsolute(source) &&
        whatwgUrl.parseURL(source) != null &&
        !isVirtualModule
      ) {
        // don't resolve relative and valid urls
        return source;
      }

      const filePath = getRequestFilePath(context.url, rootDir);

      try {
        const rollupPluginContext = createRollupPluginContextAdapter(
          rollupPluginContexts.pluginContext,
          wdsPlugin,
          config,
          fileWatcher,
          context,
          pluginMetaPerModule,
        );

        let resolvableImport = source;
        let importSuffix = '';

        const resolverCacheForContext =
          resolverCache.get(context) ?? new WeakMap<WdsPlugin, Set<string>>();
        resolverCache.set(context, resolverCacheForContext);
        const resolverCacheForPlugin =
          resolverCacheForContext.get(wdsPlugin) ?? new Set<string>();
        resolverCacheForContext.set(wdsPlugin, resolverCacheForPlugin);

        if (resolverCacheForPlugin.has(`${source}:${filePath}`)) {
          return undefined;
        }

        let result = null;
        for (const idResolver of idResolvers) {
          const idResolverHandler =
            typeof idResolver === 'function' ? idResolver : idResolver.handler;
          result = await idResolverHandler.call(rollupPluginContext, resolvableImport, filePath, {
            ...resolveOptions,
            attributes: {
              ...((resolveOptions?.assertions as Record<string, string>) ?? {}),
            },
            isEntry: false,
          });
          if (result) break;
        }

        if (!result && injectedFilePath) {
          result = resolvableImport;
        }

        let resolvedImportPath: string | undefined = undefined;
        if (typeof result === 'string') {
          resolvedImportPath = result;
        } else if (typeof result === 'object' && typeof result?.id === 'string') {
          resolvedImportPath = result.id;
          savePluginMeta(result.id, result);
        }

        if (!resolvedImportPath) {
          if (
            !['/', './', '../'].some(prefix => resolvableImport.startsWith(prefix)) &&
            adapterOptions.throwOnUnresolvedImport
          ) {
            const errorMessage = red(`Could not resolve import ${cyan(`"${source}"`)}.`);
            if (typeof code === 'string' && typeof column === 'number' && typeof line === 'number') {
              throw new PluginSyntaxError(errorMessage, filePath, code, column, line);
            } else {
              throw new PluginError(errorMessage);
            }
          }
          return undefined;
        }

        if (resolvedImportPath.includes('\0')) {
          const filename = path.basename(
            resolvedImportPath.replace(/\0*/g, '').split('?')[0].split('#')[0],
          );
          const matches = resolvedImportPath.match(OUTSIDE_ROOT_REGEXP);
          if (matches) {
            const upDirs = new Array(parseInt(matches[1], 10) + 1).join(`..${path.sep}`);
            resolvedImportPath = `\0${path.resolve(`${upDirs}${matches[2]}`)}`;
          }
          const urlParam = encodeURIComponent(resolvedImportPath);
          return `${VIRTUAL_FILE_PREFIX}/${filename}?${NULL_BYTE_PARAM}=${urlParam}`;
        }

        if (!isAbsoluteFilePath(resolvedImportPath)) {
          return `${resolvedImportPath}`;
        }

        if (isOutsideRootDir(resolvedImportPath)) {
          return `${resolvedImportPath}`;
        }

        const normalizedPath = path.normalize(resolvedImportPath);
        const normalizedRootDir = rootDir.endsWith(path.sep) ? rootDir : rootDir + path.sep;

        if (!normalizedPath.startsWith(normalizedRootDir)) {
          const relativePath = path.relative(rootDir, normalizedPath);
          const dirUp = `..${path.sep}`;
          const lastDirUpIndex = relativePath.lastIndexOf(dirUp) + 3;
          const dirUpStrings = relativePath.substring(0, lastDirUpIndex).split(path.sep);
          if (dirUpStrings.length === 0 || dirUpStrings.some(str => !['..', ''].includes(str))) {
            const errorMessage =
              red(`\n\nResolved ${cyan(source)} to ${cyan(resolvedImportPath)}.\n\n`) +
              red(
                'This path could not be converted to a browser path. Please file an issue with a reproduction.',
              );
            if (typeof code === 'string' && typeof column === 'number' && typeof line === 'number') {
              throw new PluginSyntaxError(errorMessage, filePath, code, column, line);
            } else {
              throw new PluginError(errorMessage);
            }
          }
          const importPath = toBrowserPath(relativePath.substring(lastDirUpIndex));
          resolvedImportPath = `/__wds-outside-root__/${dirUpStrings.length - 1}/${importPath}`;
        } else {
          let relativeImportFilePath = '';
          if (context.url.match(OUTSIDE_ROOT_REGEXP)) {
            const pathInsideRootDir = `/${normalizedPath.replace(normalizedRootDir, '')}`;
            const resolveRelativeTo = path.dirname(context.url);
            relativeImportFilePath = path.relative(resolveRelativeTo, pathInsideRootDir);
          } else {
            const resolveRelativeTo = path.dirname(filePath);
            relativeImportFilePath = path.relative(resolveRelativeTo, resolvedImportPath);
          }
          resolvedImportPath = `./${toBrowserPath(relativeImportFilePath)}`;
        }

        return `${resolvedImportPath}${importSuffix}`;
      } catch (error) {
        throw wrapRollupError(filePath, context, error);
      }
    },

    async serve(context) {
      if (!rollupPlugin.load) return;

      if (
        context.path.startsWith(WDS_FILE_PREFIX) &&
        !context.path.startsWith(VIRTUAL_FILE_PREFIX)
      ) {
        return;
      }

      let filePath;
      if (
        context.path.startsWith(VIRTUAL_FILE_PREFIX) &&
        context.URL.searchParams.has(NULL_BYTE_PARAM)
      ) {
        filePath = context.URL.searchParams.get(NULL_BYTE_PARAM) as string;
      } else {
        filePath = path.join(rootDir, context.path);
      }

      try {
        const rollupPluginContext = createRollupPluginContextAdapter(
          rollupPluginContexts.pluginContext,
          wdsPlugin,
          config,
          fileWatcher,
          context,
          pluginMetaPerModule,
        );

        let result;
        if (typeof rollupPlugin.load === 'function') {
          result = await rollupPlugin.load?.call(rollupPluginContext, filePath);
        }

        if (typeof result === 'string') {
          return { body: result, type: 'js' };
        }
        if (result != null && typeof result?.code === 'string') {
          savePluginMeta(filePath, result);
          return { body: result.code, type: 'js' };
        }
      } catch (error) {
        throw wrapRollupError(filePath, context, error);
      }

      return undefined;
    },

    async transform(context) {
      if (context.path.startsWith(WDS_FILE_PREFIX)) return;

      // --- JS transform ---
      if (context.response.is('js') && rollupPlugin.transform) {
        const filePath = path.join(rootDir, context.path);
        try {
          const rollupPluginContext = createRollupPluginContextAdapter(
            rollupPluginContexts.transformPluginContext,
            wdsPlugin,
            config,
            fileWatcher,
            context,
            pluginMetaPerModule,
          );

          let result;
          if (typeof rollupPlugin.transform === 'function') {
            result = await rollupPlugin.transform?.call(
              rollupPluginContext as TransformPluginContext,
              context.body as string,
              filePath,
            );
          }

          let transformedCode: string | undefined = undefined;
          if (typeof result === 'string') transformedCode = result;
          if (typeof result === 'object' && typeof result?.code === 'string') {
            savePluginMeta(filePath, result);
            transformedCode = result.code;
          }

          if (transformedCode) {
            transformedFiles.add(context.path);
            return transformedCode;
          }
          return;
        } catch (error) {
          throw wrapRollupError(filePath, context, error);
        }
      }

      // --- HTML transform ---
      if (context.response.is('html')) {
        let html = context.body as string;
        const filePath = getRequestFilePath(context.url, rootDir);
        let transformed = false;

        // transformIndexHtml hook
        if (typeof vitePlugin.transformIndexHtml === 'function') {
          try {
            const result = await vitePlugin.transformIndexHtml(html, {
              filename: filePath,
              path: context.path,
            });

            if (typeof result === 'string') {
              html = result;
              transformed = true;
            } else if (Array.isArray(result)) {
              html = applyTagsToHtml(html, result);
              transformed = true;
            } else if (result && typeof result === 'object' && 'html' in result) {
              html = (result as { html: string; tags?: ViteHtmlTagDescriptor[] }).html;
              if ((result as { html: string; tags?: ViteHtmlTagDescriptor[] }).tags?.length) {
                html = applyTagsToHtml(
                  html,
                  (result as { html: string; tags?: ViteHtmlTagDescriptor[] }).tags!,
                );
              }
              transformed = true;
            }
          } catch (error) {
            throw wrapRollupError(filePath, context, error);
          }
        }

        // Rollup-compatible transform of inline scripts
        if (rollupPlugin.transform) {
          const documentAst = parseHtml(html);
          const inlineScripts = queryAll(
            documentAst,
            predicates.AND(
              predicates.hasTagName('script'),
              predicates.NOT(predicates.hasAttr('src')),
            ),
          );

          try {
            for (const node of inlineScripts) {
              const code = getTextContent(node);
              const rollupPluginContext = createRollupPluginContextAdapter(
                rollupPluginContexts.transformPluginContext,
                wdsPlugin,
                config,
                fileWatcher,
                context,
                pluginMetaPerModule,
              );

              let result;
              if (typeof rollupPlugin.transform === 'function') {
                result = await rollupPlugin.transform?.call(
                  rollupPluginContext as TransformPluginContext,
                  code,
                  filePath,
                );
              }

              let transformedCode: string | undefined = undefined;
              if (typeof result === 'string') transformedCode = result;
              if (typeof result === 'object' && typeof result?.code === 'string') {
                savePluginMeta(filePath, result);
                transformedCode = result.code;
              }

              if (transformedCode) {
                transformedFiles.add(context.path);
                setTextContent(node, transformedCode);
                transformed = true;
              }
            }
            if (transformed) {
              return serializeHtml(documentAst);
            }
          } catch (error) {
            throw wrapRollupError(filePath, context, error);
          }
        } else if (transformed) {
          // only transformIndexHtml was applied, no inline-script transform needed
          return html;
        }
      }
    },

    fileParsed(context) {
      if (!rollupPlugin.moduleParsed) return;

      const rollupPluginContext = createRollupPluginContextAdapter(
        rollupPluginContexts.transformPluginContext,
        wdsPlugin,
        config,
        fileWatcher,
        context,
        pluginMetaPerModule,
      );
      const filePath = getRequestFilePath(context.url, rootDir);
      const info = rollupPluginContext.getModuleInfo(filePath);
      if (!info) throw new Error(`Missing info for module ${filePath}`);
      if (typeof rollupPlugin.moduleParsed === 'function') {
        rollupPlugin.moduleParsed?.call(rollupPluginContext as TransformPluginContext, info);
      }
    },
  };

  return wdsPlugin;
}
