export { RollupNodeResolveOptions } from '@web/dev-server-rollup';
export { startDevServer } from './startDevServer';
export { mergeConfigs } from './config/mergeConfigs';
export { DevServerStartError } from './DevServerStartError';
export { esbuildPlugin } from './plugins/esbuildPlugin';
export { nodeResolvePlugin } from './plugins/nodeResolvePlugin';

import type { DevServerConfig as FullDevServerConfig } from './config/DevServerConfig';
export type DevServerConfig = Partial<FullDevServerConfig>;
