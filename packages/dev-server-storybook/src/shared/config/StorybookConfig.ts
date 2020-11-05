import { RollupOptions } from 'rollup';

export interface MainJs {
  stories: string[];
  addons?: string[];
  rollupConfig?: (config: RollupOptions) => Promise<RollupOptions> | RollupOptions;
}

export interface StorybookConfig {
  mainJs: MainJs;
  mainJsPath: string;
  previewJsPath: string;
  managerHead?: string;
  previewBody?: string;
  previewHead?: string;
}
