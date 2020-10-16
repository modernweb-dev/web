import { TestRunnerCoreConfig, TestRunnerGroupConfig } from '@web/test-runner-core';
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
import { TestRunnerStartError } from './TestRunnerStartError';
import commandLineArgs from 'command-line-args';
import chalk from 'chalk';

import { puppeteerLauncher, playwrightLauncher } from './loadLauncher';
import { collectGroupConfigs } from './collectGroupConfigs';
import { nodeResolvePlugin } from './nodeResolvePlugin';
import { esbuildPlugin } from './esbuildPlugin';

export interface TestRunnerConfig extends Partial<TestRunnerCoreConfig> {
  groups?: string | string[] | TestRunnerGroupConfig[];
  nodeResolve?: boolean | RollupNodeResolveOptions;
  preserveSymlinks?: boolean;
  esbuildTarget?: string | string[];
}

export interface FullTestRunnerConfig extends TestRunnerCoreConfig {
  groups?: string | string[] | TestRunnerGroupConfig[];
  nodeResolve?: boolean | RollupNodeResolveOptions;
  preserveSymlinks?: boolean;
  esbuildTarget?: string | string[];
}

export interface TestRunnerCliArgsConfig extends Omit<TestRunnerConfig, 'browsers'> {
  group?: string;
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
    name: 'groups',
    type: String,
    description: 'Pattern of group config files.',
  },
  {
    name: 'group',
    type: String,
    description:
      'Name of the group to run tests for. When this is set, the other groups are ignored.',
  },
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
    name: 'esbuild-target',
    type: String,
    multiple: true,
    description:
      'JS language target to compile down to using esbuild. Recommended value is "auto", which compiles based on user agent. Check the docs for more options.',
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

    const config = await readConfig<FullTestRunnerConfig>(cliArgsConfig);
    const { rootDir } = config;
    let groupConfigs: TestRunnerGroupConfig[] = [];

    if (config.groups) {
      const configPatterns: string[] = [];
      for (const entry of typeof config.groups === 'string' ? [config.groups] : config.groups) {
        if (typeof entry === 'object') {
          groupConfigs.push(entry);
        } else {
          configPatterns.push(entry);
        }
      }
      // group entries which are strings are globs which point to group conigs
      groupConfigs.push(...(await collectGroupConfigs(configPatterns)));
    }

    if (groupConfigs.find(g => g.name === 'default')) {
      throw new Error(
        'Cannot create a group named "default". This named is reserved by the test runner.',
      );
    }

    if (cliArgs.group != null) {
      if (cliArgs.group === 'default') {
        // default group is an alias for the root config
        groupConfigs = [];
      } else {
        const groupConfig = groupConfigs.find(c => c.name === cliArgs.group);
        if (!groupConfig) {
          throw new TestRunnerStartError(`Could not find any group named ${cliArgs.group}`);
        }

        // when focusing a group, ensure that the "default" group isn't run
        // we can improve this by relying only on groups inside the test runner itself
        if (groupConfig.files == null) {
          groupConfig.files = config.files;
        }
        config.files = undefined;

        groupConfigs = [groupConfig];
      }
    }

    if (cliArgs.puppeteer) {
      if (config.browsers && config.browsers.length > 0) {
        throw new TestRunnerStartError(
          'The --puppeteer flag cannot be used when defining browsers manually in your config.',
        );
      }
      config.browsers = puppeteerLauncher(cliArgs.browsers);
    } else if (cliArgs.playwright) {
      if (config.browsers && config.browsers.length > 0) {
        throw new TestRunnerStartError(
          'The --playwright flag cannot be used when defining browsers manually in your config.',
        );
      }
      config.browsers = playwrightLauncher(cliArgs.browsers);
    } else {
      if (cliArgs.browsers != null) {
        throw new TestRunnerStartError(
          `The browsers option must be used along with the puppeteer or playwright option.`,
        );
      }

      // add default chrome launcher if the user did not configure their own browsers
      if (!config.browsers) {
        config.browsers = [chromeLauncher()];
      }
    }

    if (typeof rootDir !== 'string') {
      throw new TestRunnerStartError('No rootDir specified.');
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

    // plugin with a noop transformImport hook, this will cause the dev server to analyze modules and
    // catch syntax errors. this way we still report syntax errors when the user has no flags enabled
    config.plugins.unshift({
      name: 'syntax-checker',
      transformImport() {
        return undefined;
      },
    });

    if (config.nodeResolve) {
      const userOptions = typeof config.nodeResolve === 'object' ? config.nodeResolve : undefined;
      config.plugins!.unshift(nodeResolvePlugin(rootDir, config.preserveSymlinks, userOptions));
    }

    if (config.esbuildTarget) {
      config.plugins.unshift(esbuildPlugin(config.esbuildTarget));
    }

    config.plugins.unshift(setViewportPlugin(), emulateMediaPlugin(), setUserAgentPlugin());

    const validatedConfig = validateCoreConfig<FullTestRunnerConfig>(config);
    return defaultStartTestRunner(validatedConfig, groupConfigs, { autoExitProcess });
  } catch (error) {
    if (error instanceof TestRunnerStartError) {
      console.error(chalk.red(`\nFailed to start test runner: ${error.message}\n`));
    } else {
      console.error(error);
    }
    if (autoExitProcess) {
      process.exit(1);
    } else {
      throw error;
    }
  }
}
