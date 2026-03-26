export type { RollupNodeResolveOptions } from '@web/dev-server-rollup';
export { startDevServer } from './startDevServer.ts';
export { mergeConfigs } from './config/mergeConfigs.ts';
export { DevServerStartError } from './DevServerStartError.ts';
export { esbuildPlugin } from './plugins/esbuildPlugin.ts';
export { nodeResolvePlugin } from './plugins/nodeResolvePlugin.ts';

import type { DevServerConfig as FullDevServerConfig } from './config/DevServerConfig.ts';
export type DevServerConfig = Partial<FullDevServerConfig>;
