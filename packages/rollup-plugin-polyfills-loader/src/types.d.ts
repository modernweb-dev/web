import { PolyfillsConfig, FileType } from '@web/polyfills-loader';

export interface OutputConfig {
  name: string;
  type?: FileType;
}

export interface LegacyOutputConfig extends OutputConfig {
  test: string;
}

export interface RollupPluginPolyfillsLoaderConfig {
  modernOutput?: OutputConfig;
  legacyOutput?: LegacyOutputConfig | LegacyOutputConfig[];
  polyfills?: PolyfillsConfig;
  polyfillsDir?: string;
  externalLoaderScript?: boolean;
}
