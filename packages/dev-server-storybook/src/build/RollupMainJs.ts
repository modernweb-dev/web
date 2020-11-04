import { RollupOptions } from 'rollup';
import { MainJs } from '../shared/readStorybookConfig';

export interface RollupMainJs extends MainJs {
  rollupConfigDecorator?: (config: RollupOptions) => Promise<RollupOptions> | RollupOptions;
}
