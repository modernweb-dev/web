import { RollupOptions } from 'rollup';
import { MainJs } from '../shared/config/readStorybookConfig';

export interface RollupMainJs extends MainJs {
  rollupConfig?: (config: RollupOptions) => Promise<RollupOptions> | RollupOptions;
}
