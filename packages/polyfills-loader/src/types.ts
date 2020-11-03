export interface PolyfillsLoaderConfig {
  // files to load on modern browsers. loaded when there are no
  // legacy entrypoints which match
  modern?: ModernEntrypoint;
  // legacy entrypoints to load on older browsers, each entrypoint
  // consists of a test when to load it. tests are executed in the order
  // that they appear using if else statement where the final else
  // is the modern entrypoint for when no legacy entrypoint matches
  // only one entrypoint is loaded in total
  legacy?: LegacyEntrypoint[];
  // polyfills to load
  polyfills?: PolyfillsConfig;
  // directory to output polyfills into
  polyfillsDir?: string;
  // whether to minify the loader output
  minify?: boolean;
  // whether to preload the modern entrypoint, best for performance
  // defaults to true
  preload?: boolean;
}

export interface PolyfillsConfig {
  // custom polyfills provided by the user
  custom?: PolyfillConfig[];
  // whether to hash polyfill filenames
  hash?: boolean;
  // js language polyfills (array functions, map etc.)
  coreJs?: boolean;
  // if the value is 'always' it is always loaded, otherwise only on browsers
  // which don't support modules
  regeneratorRuntime?: boolean | 'always';
  // custom-elements and shady-dom
  webcomponents?: boolean;
  fetch?: boolean;
  abortController?: boolean;
  intersectionObserver?: boolean;
  resizeObserver?: boolean;
  dynamicImport?: boolean;
  // systemjs s.js
  systemjs?: boolean;
  // systemjs extended version with import maps
  systemjsExtended?: boolean;
  esModuleShims?: boolean;
  // shady-css-custom-style and shady-css-scoped-element
  shadyCssCustomStyle?: boolean;
}

export interface PolyfillConfig {
  // name of the polyfill
  name: string;
  // polyfill path
  path: string | string[];
  // expression which should evaluate to true to load the polyfill
  test?: string;
  // how to load the polyfill, defaults to script
  fileType?: FileType;
  // whether to minify the polyfill
  minify?: boolean;
  // code used to initialze the module
  initializer?: string;
}

export interface ModernEntrypoint {
  // files to loa for the modern entrypoint
  files: File[];
}

export interface LegacyEntrypoint {
  // runtime feature detection instructing when to load the legacy entrypoint
  test: string;
  // files to load for this legacy entrypoint
  files: File[];
}

export type FileType = 'script' | 'module' | 'systemjs';

export interface File {
  // the type of script, instructing how to load it
  type: FileType;
  // the path of the file
  path: string;
}

export interface GeneratedFile extends File {
  // the content of the generated file
  content: string;
}

export interface PolyfillFile extends GeneratedFile {
  // name of the polyfill
  name: string;
  // runtime feature detection to load this polyfill
  test?: string;
  // code run after the polyfill is loaded to initialize the polyfill
  initializer?: string;
}

export interface PolyfillsLoader {
  // the polyfills loader code
  code: string;
  // files generated for polyfills
  polyfillFiles: GeneratedFile[];
}
