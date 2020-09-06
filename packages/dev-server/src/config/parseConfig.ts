import { getPortPromise } from 'portfinder';
import path from 'path';

import { DevServerCliArgs } from './readCliArgs';
import { mergeConfigs } from './mergeConfigs';
import { DevServerConfig } from './DevServerConfig';
import { esbuildPlugin } from '../plugins/esbuildPlugin';
import { watchPlugin } from '../plugins/watchPlugin';
import { nodeResolvePlugin } from '../plugins/nodeResolvePlugin';
import { DevServerStartError } from '../DevServerStartError';

const defaultConfig: Partial<DevServerConfig> = {
  rootDir: process.cwd(),
  hostname: 'localhost',
  eventStream: true,
  clearTerminalOnReload: true,
  middleware: [],
  plugins: [],
};

function validate(config: Record<string, unknown>, key: string, type: string) {
  if (config[key] == null) {
    return;
  }

  if (typeof config[key] !== type) {
    throw new DevServerStartError(`Configuration error: The ${key} setting should be a ${type}.`);
  }
}

const stringSettings = ['rootDir', 'hostname', 'basePath', 'appIndex', 'sslKey', 'sslCert'];
const numberSettings = ['port'];
const booleanSettings = ['watch', 'preserveSymlinks', 'http2', 'eventStream'];

export function validateConfig(config: Partial<DevServerConfig>) {
  stringSettings.forEach(key => validate(config, key, 'string'));
  numberSettings.forEach(key => validate(config, key, 'number'));
  booleanSettings.forEach(key => validate(config, key, 'boolean'));

  if (
    config.esbuildTarget != null &&
    !(typeof config.esbuildTarget === 'string' || Array.isArray(config.esbuildTarget))
  ) {
    throw new Error(`Configuration error: The esbuildTarget setting should be a string or array.`);
  }

  if (
    config.open != null &&
    !(typeof config.open === 'string' || typeof config.open === 'boolean')
  ) {
    throw new Error(`Configuration error: The open setting should be a string or boolean.`);
  }

  return config as DevServerConfig;
}

export async function parseConfig(
  config: Partial<DevServerConfig>,
  cliArgs?: DevServerCliArgs,
): Promise<DevServerConfig> {
  const mergedConfigs = mergeConfigs(defaultConfig, config, cliArgs);
  const finalConfig = validateConfig(mergedConfigs);

  // ensure rootDir is always resolved
  if (typeof finalConfig.rootDir === 'string') {
    finalConfig.rootDir = path.resolve(finalConfig.rootDir);
  }

  // generate a default random port
  if (typeof finalConfig.port !== 'number') {
    const port = 9000 + Math.floor(Math.random() * 1000);
    finalConfig.port = await getPortPromise({ port });
  }

  // map flags to plugin
  if (finalConfig?.esbuildTarget) {
    finalConfig.plugins!.push(esbuildPlugin(finalConfig.esbuildTarget));
  }

  if (finalConfig.nodeResolve) {
    const userOptions = typeof config.nodeResolve === 'object' ? config.nodeResolve : undefined;
    finalConfig.plugins!.push(
      nodeResolvePlugin(finalConfig.rootDir!, config.preserveSymlinks, userOptions),
    );
  }

  if (finalConfig.watch) {
    finalConfig.plugins!.push(watchPlugin());
  }

  return finalConfig;
}
