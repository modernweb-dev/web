export { RollupNodeResolveOptions } from '@web/dev-server-rollup';
export { mergeConfigs } from './config/mergeConfigs.js';
export { DevServerStartError } from './DevServerStartError.js';
export { esbuildPlugin } from './plugins/esbuildPlugin.js';
export { nodeResolvePlugin } from './plugins/nodeResolvePlugin.js';
export { startDevServer } from './startDevServer.js';

import type { DevServerConfig as FullDevServerConfig } from './config/DevServerConfig.js';
export type DevServerConfig = Partial<FullDevServerConfig>;
