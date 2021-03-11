import { fileTypes, PolyfillsLoaderConfig, File } from '@web/polyfills-loader';

const PLUGIN = '[rollup-plugin-polyfills-loader]';

export function createError(msg: string) {
  return new Error(`${PLUGIN} ${msg}`);
}

export function shouldInjectLoader(config: PolyfillsLoaderConfig) {
  if (config.modern!.files.some((f: File) => f.type !== fileTypes.MODULE)) {
    return true;
  }

  if (config.legacy && config.legacy.length > 0) {
    return true;
  }

  if (config.polyfills && config.polyfills.custom && config.polyfills.custom.length > 0) {
    return true;
  }

  return !!(
    config.polyfills &&
    Object.entries(config.polyfills).some(
      ([k, v]) => !['hash', 'custom'].includes(k) && v !== false,
    )
  );
}
