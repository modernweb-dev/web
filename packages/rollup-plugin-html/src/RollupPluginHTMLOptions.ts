import { OutputChunk, OutputOptions, OutputBundle } from 'rollup';

export interface InputHTMLOptions {
  /** The html source code. If set, overwrites path. */
  html?: string;
  /** Name of the HTML files when using the html option. */
  name?: string;
  /** Path to the HTML file, or glob to multiple HTML files. */
  path?: string;
}

export interface RollupPluginHTMLOptions {
  /** HTML file(s) to use as input. If not set, uses rollup input option. */
  input?: string | InputHTMLOptions | (string | InputHTMLOptions)[];
  /** Whether to preserve or flatten the directory structure of the HTML file. */
  flattenOutput?: boolean;
  /** Directory to resolve absolute paths relative to, and to use as base for non-flatted filename output. */
  rootDir?: string;
  /** Path to load modules and assets from at runtime. */
  publicPath?: string;
  /** Transform asset source before output. */
  transformAsset?: TransformAssetFunction | TransformAssetFunction[];
  /** Transform HTML file before output. */
  transformHtml?: TransformHtmlFunction | TransformHtmlFunction[];
  /** Whether to extract and bundle assets referenced in HTML. Defaults to true. */
  extractAssets?: boolean;
  /** Define a full absolute url to your site (e.g. https://domain.com) */
  absoluteBaseUrl?: string;
  /** Whether to set full absolute urls for ['meta[property=og:image]', 'link[rel=canonical]', 'meta[property=og:url]'] or not. Requires a absoluteBaseUrl to be set. Default to true. */
  absoluteSocialMediaUrls?: boolean;
  /** Should a service worker registration script be injected. Defaults to false. */
  injectServiceWorker?: boolean;
  /** File system path to the generated service worker file */
  serviceWorkerPath?: string;
  /** Prefix to strip from absolute paths when resolving assets and scripts, for example when using a base path that does not exist on disk. */
  absolutePathPrefix?: string;
}

export interface GeneratedBundle {
  name: string;
  options: OutputOptions;
  bundle: OutputBundle;
}

export interface EntrypointBundle extends GeneratedBundle {
  entrypoints: {
    // path to import the entrypoint, can be used in an import statement
    // or script tag directly
    importPath: string;
    // associated rollup chunk, useful if you need to get more information
    // about the chunk. See the rollup docs for type definitions
    chunk: OutputChunk;
  }[];
}

export interface TransformHtmlArgs {
  // the rollup bundle to be injected on the page. if there are multiple
  // rollup output options, this will reference the first bundle
  //
  // if one of the input options was set, only the bundled module script contained
  // in the HTML input are available to be injected in both the bundle and bundles
  // options
  bundle: EntrypointBundle;
  // the rollup bundles to be injected on the page. if there is only one
  // build output options, this will be an array with one option
  bundles: Record<string, EntrypointBundle>;
  htmlFileName: string;
}

export type TransformHtmlFunction = (
  html: string,
  args: TransformHtmlArgs,
) => string | Promise<string>;

export type TransformAssetFunction = (
  content: Buffer,
  filePath: string,
) => string | Buffer | Promise<string | Buffer>;
