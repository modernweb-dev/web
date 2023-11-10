export { RollupNodeResolveOptions } from '@web/dev-server-rollup';
export { startDevServer } from './startDevServer.js';
export { mergeConfigs } from './config/mergeConfigs.js';
export { DevServerStartError } from './DevServerStartError.js';
export { esbuildPlugin } from './plugins/esbuildPlugin.js';
export { nodeResolvePlugin } from './plugins/nodeResolvePlugin.js';

import type { DevServerConfig as FullDevServerConfig } from './config/DevServerConfig.js';
export type DevServerConfig = Partial<FullDevServerConfig>;
