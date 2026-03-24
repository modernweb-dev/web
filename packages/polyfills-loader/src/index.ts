export { createPolyfillsData } from './createPolyfillsData.ts';
export { createPolyfillsLoader } from './createPolyfillsLoader.ts';
export { injectPolyfillsLoader } from './injectPolyfillsLoader.ts';
export { hasFileOfType, fileTypes, getScriptFileType } from './utils.ts';
export type {
  PolyfillsLoaderConfig,
  PolyfillsConfig,
  PolyfillConfig,
  ModernEntrypoint,
  LegacyEntrypoint,
  FileType,
  File,
  GeneratedFile,
  PolyfillFile,
  PolyfillsLoader,
} from './types.ts';
