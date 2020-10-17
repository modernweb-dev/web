import { OutputChunk, OutputOptions, OutputBundle } from 'rollup';

export interface InputHTMLOptions {
  html?: string;
  path?: string;
  name?: string;
}

export interface RollupPluginHTMLOptions {
  input?: string | InputHTMLOptions | (string | InputHTMLOptions)[];
  flattenOutput?: boolean;
  rootDir?: string;
  publicPath?: string;
  transform?: TransformFunction | TransformFunction[];
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

export interface InjectArgs {
  // if one of the input options was set, this references the HTML set as input
  html?: string;
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
}

export interface TransformArgs {
  // see InjectArgs
  bundle: EntrypointBundle;
  // see InjectArgs
  bundles: Record<string, EntrypointBundle>;
  htmlFileName: string;
}

export type TransformFunction = (html: string, args: TransformArgs) => string | Promise<string>;
