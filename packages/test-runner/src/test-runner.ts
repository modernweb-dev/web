#!/usr/bin/env node
import { TestRunnerCoreConfig } from '@web/test-runner-core';
import {
  readCliArgsConfig,
  readConfig,
  startTestRunner,
  validateCoreConfig,
} from '@web/test-runner-cli';
import { testRunnerServer, TestRunnerServerConfig } from '@web/test-runner-server';
import { chromeLauncher } from '@web/test-runner-chrome';
import { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import commandLineArgs from 'command-line-args';
import chalk from 'chalk';

import { puppeteerLauncher, playwrightLauncher } from './loadLauncher';
import { nodeResolvePlugin } from './nodeResolvePlugin';

export interface TestRunnerConfig extends TestRunnerCoreConfig, TestRunnerServerConfig {
  nodeResolve?: boolean | RollupNodeResolveOptions;
  preserveSymlinks?: boolean;
}

export interface TestRunnerCliArgsConfig extends Omit<TestRunnerConfig, 'browsers'> {
  puppeteer?: boolean;
  playwright?: boolean;
  browsers?: string[];
}

const cliOptions: commandLineArgs.OptionDefinition[] = [
  {
    name: 'preserve-symlinks',
    type: Boolean,
  },
  {
    name: 'puppeteer',
    type: Boolean,
  },
  {
    name: 'playwright',
    type: Boolean,
  },
  {
    name: 'browsers',
    type: String,
    multiple: true,
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

(async () => {
  try {
    const cliArgs = readCliArgsConfig<TestRunnerCliArgsConfig>(cliOptions);
    const cliArgsConfig: Partial<TestRunnerConfig> = {};
    for (const [key, value] of Object.entries(cliArgs)) {
      if (key !== 'browsers') {
        // cli args are read from a file, they are validated by cli-options and later on as well
        (cliArgsConfig as any)[key] = value;
      }
    }

    cliArgsConfig.testFramework = '@web/test-runner-mocha/dist/autorun.js';

    if (cliArgs.puppeteer) {
      cliArgsConfig.browsers = puppeteerLauncher(cliArgs.browsers);
    } else if (cliArgs.playwright) {
      cliArgsConfig.browsers = playwrightLauncher(cliArgs.browsers);
    } else {
      if (cliArgs.browsers != null) {
        throw new Error(
          `The browsers option must be used along with the puppeteer or playwright option.`,
        );
      }
      cliArgsConfig.browsers = chromeLauncher();
    }

    const config = await readConfig<TestRunnerConfig>(cliArgsConfig);
    const { rootDir } = config;

    if (typeof rootDir !== 'string') {
      throw new Error('No rootDir specified.');
    }

    if (!config.server) {
      const serverConfig: TestRunnerServerConfig = {
        plugins: config.plugins ?? [],
        middleware: config.middleware ?? [],
      };

      if (config.nodeResolve) {
        const userOptions = typeof config.nodeResolve === 'object' ? config.nodeResolve : undefined;
        serverConfig.plugins!.push(
          nodeResolvePlugin(rootDir, config.preserveSymlinks, userOptions),
        );
      }

      config.server = testRunnerServer(serverConfig);
    } else {
      if (config.nodeResolve) {
        throw new Error('Cannot use the nodeResolve option when configuring a custom server.');
      }
      if (config.preserveSymlinks) {
        throw new Error('Cannot use the preserveSymlinks option when configuring a custom server.');
      }
    }

    const validatedConfig = validateCoreConfig<TestRunnerConfig>(config);
    startTestRunner(validatedConfig);
  } catch (error) {
    console.error(chalk.red(`\nFailed to start test runner: ${error.message}\n`));
    process.exit(1);
  }
})();
