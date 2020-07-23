import {
  readCliArgsConfig,
  readConfig,
  startDevServer as originalStartDevServer,
  validateCoreConfig,
} from '@web/dev-server-cli';
import { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import commandLineArgs from 'command-line-args';
import chalk from 'chalk';

import { nodeResolvePlugin } from './nodeResolvePlugin';
import { DevServerCliConfig } from '@web/dev-server-cli/dist/config/DevServerCliConfig';

export interface DevServerConfig extends DevServerCliConfig {
  nodeResolve?: boolean | RollupNodeResolveOptions;
  preserveSymlinks?: boolean;
}

export interface DevServerCliArgsConfig extends DevServerConfig {
  // CLI-only options go here
}

export interface StartDevServerOptions {
  autoExitProcess?: boolean;
  logStartMessage?: boolean;
  argv?: string[];
}

const cliOptions: commandLineArgs.OptionDefinition[] = [
  {
    name: 'preserve-symlinks',
    type: Boolean,
  },
  {
    name: 'node-resolve',
    type: Boolean,
  },
  {
    name: 'debug',
    type: Boolean,
  },
];

export async function startDevServer(options: StartDevServerOptions = {}) {
  const { autoExitProcess = true, argv = process.argv, logStartMessage = true } = options;

  try {
    const cliArgs = readCliArgsConfig<DevServerCliArgsConfig>(cliOptions, argv);
    const cliArgsConfig: Partial<DevServerConfig> = {};
    for (const [key, value] of Object.entries(cliArgs)) {
      // cli args are read from a file, they are validated by cli-options and later on as well
      (cliArgsConfig as any)[key] = value;
    }

    const config = await readConfig<DevServerConfig>(cliArgsConfig);
    const { rootDir } = config;

    if (typeof rootDir !== 'string') {
      throw new Error('No rootDir specified.');
    }

    if (config.nodeResolve) {
      const userOptions = typeof config.nodeResolve === 'object' ? config.nodeResolve : undefined;
      config.plugins!.push(nodeResolvePlugin(rootDir, config.preserveSymlinks, userOptions));
    }

    const validatedConfig = validateCoreConfig<DevServerConfig>(config);
    return originalStartDevServer(validatedConfig, { autoExitProcess, logStartMessage });
  } catch (error) {
    console.error(chalk.red(`\nFailed to start dev server: ${error.message}\n`));
    process.exit(1);
  }
}
