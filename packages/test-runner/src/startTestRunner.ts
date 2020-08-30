import { TestRunnerCoreConfig } from '@web/test-runner-core';
import {
  readCliArgsConfig,
  readConfig,
  startTestRunner as defaultStartTestRunner,
  validateCoreConfig,
  defaultReporter,
} from '@web/test-runner-cli';
import { chromeLauncher } from '@web/test-runner-chrome';
import {
  setViewportPlugin,
  emulateMediaPlugin,
  setUserAgentPlugin,
} from '@web/test-runner-commands/plugins';
import { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import commandLineArgs from 'command-line-args';
import chalk from 'chalk';

import { puppeteerLauncher, playwrightLauncher } from './loadLauncher';
import { nodeResolvePlugin } from './nodeResolvePlugin';

export interface TestRunnerConfig extends TestRunnerCoreConfig {
  nodeResolve?: boolean | RollupNodeResolveOptions;
  preserveSymlinks?: boolean;
}

export interface TestRunnerCliArgsConfig extends Omit<TestRunnerConfig, 'browsers'> {
  puppeteer?: boolean;
  playwright?: boolean;
  browsers?: string[];
}

export interface StartTestRunnerOptions {
  autoExitProcess?: boolean;
  argv?: string[];
}

const cliOptions: (commandLineArgs.OptionDefinition & { description: string })[] = [
  {
    name: 'node-resolve',
    type: Boolean,
    description: 'Resolve bare module imports using node resolution',
  },
  {
    name: 'preserve-symlinks',
    type: Boolean,
    description: "Don't follow symlinks when resolving imports",
  },
  {
    name: 'puppeteer',
    type: Boolean,
    description: 'Run tests using puppeteer',
  },
  {
    name: 'playwright',
    type: Boolean,
    description: 'Run tests using playwright',
  },
  {
    name: 'browsers',
    type: String,
    multiple: true,
    description: 'Browsers to run when choosing puppeteer or playwright',
  },
  {
    name: 'debug',
    type: Boolean,
    description: 'Log debug messages',
  },
];

export async function startTestRunner(options: StartTestRunnerOptions = {}) {
  const { autoExitProcess = true, argv = process.argv } = options;
  try {
    const cliArgs = readCliArgsConfig<TestRunnerCliArgsConfig>(cliOptions, argv);
    const cliArgsConfig: Partial<TestRunnerConfig> = {};

    for (const [key, value] of Object.entries(cliArgs)) {
      if (key !== 'browsers') {
        // cli args are read from a file, they are validated by cli-options and later on as well
        (cliArgsConfig as any)[key] = value;
      }
    }

    const config = await readConfig<TestRunnerConfig>(cliArgsConfig);
    const { rootDir } = config;

    if (cliArgs.puppeteer) {
      config.browsers = puppeteerLauncher(cliArgs.browsers);
    } else if (cliArgs.playwright) {
      config.browsers = playwrightLauncher(cliArgs.browsers);
    } else {
      if (cliArgs.browsers != null) {
        throw new Error(
          `The browsers option must be used along with the puppeteer or playwright option.`,
        );
      }

      // add default chrome launcher if the user did not configure their own browsers
      if (!config.browsers) {
        config.browsers = [chromeLauncher()];
      }
    }

    if (typeof rootDir !== 'string') {
      throw new Error('No rootDir specified.');
    }

    config.testFramework = {
      path: require.resolve('@web/test-runner-mocha/dist/autorun.js'),
      ...(config.testFramework ?? {}),
    };

    if (!config.reporters) {
      config.reporters = [defaultReporter()];
    }

    if (config.plugins == null) {
      config.plugins = [];
    }

    if (config.nodeResolve) {
      const userOptions = typeof config.nodeResolve === 'object' ? config.nodeResolve : undefined;
      config.plugins!.push(nodeResolvePlugin(rootDir, config.preserveSymlinks, userOptions));
    }

    config.plugins!.push(setViewportPlugin(), emulateMediaPlugin(), setUserAgentPlugin());

    const validatedConfig = validateCoreConfig<TestRunnerConfig>(config);
    return defaultStartTestRunner(validatedConfig, { autoExitProcess });
  } catch (error) {
    if (autoExitProcess) {
      console.error(chalk.red(`\nFailed to start test runner: ${error.message}\n`));
      process.exit(1);
    } else {
      throw error;
    }
  }
}
