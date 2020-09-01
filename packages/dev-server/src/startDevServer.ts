import {
  readCliArgsConfig,
  readConfig,
  startDevServer as originalStartDevServer,
  validateCoreConfig,
} from '@web/dev-server-cli';
import { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import { DevServerCliConfig } from '@web/dev-server-cli/dist/config/DevServerCliConfig';
import commandLineArgs from 'command-line-args';
import chalk from 'chalk';

import { nodeResolvePlugin } from './nodeResolvePlugin';
import { watchPlugin } from './watchPlugin';
import { esbuildPlugin } from './esbuildPlugin';

export interface DevServerConfig extends DevServerCliConfig {
  nodeResolve?: boolean | RollupNodeResolveOptions;
  watch?: boolean;
  preserveSymlinks?: boolean;
  esbuildTarget?: string | string[];
}

export interface DevServerCliArgsConfig extends DevServerConfig {
  // CLI-only options go here
}

export interface StartDevServerOptions {
  autoExitProcess?: boolean;
  logStartMessage?: boolean;
  argv?: string[];
}

const cliOptions: (commandLineArgs.OptionDefinition & { description: string })[] = [
  {
    name: 'preserve-symlinks',
    description: "Don't follow symlinks when resolving module imports.",
    type: Boolean,
  },
  {
    name: 'node-resolve',
    description: 'Resolve bare module imports using node resolution',
    type: Boolean,
  },
  {
    name: 'watch',
    alias: 'w',
    description: 'Reload the browser when files are changed.',
    type: Boolean,
  },
  {
    name: 'esbuild-target',
    type: String,
    multiple: true,
    description:
      'JS language target to compile down to using esbuild. Recommended value is "auto", which compiles based on user agent. Check the docs for more options.',
  },
  {
    name: 'debug',
    description: 'Log debug messages.',
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

    const config = await readConfig<DevServerConfig>({
      eventStream: true,
      ...cliArgsConfig,
    });
    const { rootDir } = config;

    if (typeof rootDir !== 'string') {
      throw new Error('No rootDir specified.');
    }

    if (!Array.isArray(config.plugins)) {
      config.plugins = [];
    }

    if (config.esbuildTarget) {
      config.plugins.push(esbuildPlugin(config.esbuildTarget));
    }

    if (config.nodeResolve) {
      const userOptions = typeof config.nodeResolve === 'object' ? config.nodeResolve : undefined;
      config.plugins.push(nodeResolvePlugin(rootDir, config.preserveSymlinks, userOptions));
    }

    if (config.watch) {
      config.plugins.push(watchPlugin());
    }

    const validatedConfig = validateCoreConfig<DevServerConfig>(config);
    return originalStartDevServer(validatedConfig, {
      autoExitProcess,
      logStartMessage,
      clearTerminalOnChange: config.watch,
    });
  } catch (error) {
    console.error(chalk.red(`\nFailed to start dev server: ${error.message}\n`));
    process.exit(1);
  }
}
