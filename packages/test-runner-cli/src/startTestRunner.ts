import { getPortPromise } from 'portfinder';
import { TestRunner, TestRunnerConfig, CoverageConfig } from '@web/test-runner-core';
import deepmerge from 'deepmerge';
import chalk from 'chalk';
import { TestRunnerCli } from './TestRunnerCli';
import { collectTestFiles } from './config/collectTestFiles';
import { readFileConfig } from '../js/readFileConfig';
import { readCliArgs } from './config/readCliArgs';
import { OptionDefinition } from 'command-line-args';

const defaultBaseConfig: Partial<TestRunnerConfig> = {
  watch: false,
  address: 'http://localhost',
  concurrency: 10,
  browserStartTimeout: 30000,
  sessionStartTimeout: 10000,
  sessionFinishTimeout: 20000,
};

const defaultCoverageConfig: CoverageConfig = {
  exclude: ['**/node_modules/**/*'],
  threshold: {
    statements: 0,
    functions: 0,
    branches: 0,
    lines: 0,
  },
  report: true,
  reportDir: 'coverage',
};

function validateConfig(config: Partial<TestRunnerConfig>): TestRunnerConfig {
  if (!Array.isArray(config.files) || config.files.length === 0) {
    throw new Error('No test files configured.');
  }
  if (typeof config.testFrameworkImport !== 'string') {
    throw new Error('No testFrameworkImport specified.');
  }
  if (!config.browsers) {
    throw new Error('No browsers specified.');
  }
  if (!config.server) {
    throw new Error('No server specified.');
  }
  if (typeof config.address !== 'string') {
    throw new Error('No address specified.');
  }
  if (typeof config.port !== 'number') {
    throw new Error('No port specified.');
  }

  return config as TestRunnerConfig;
}

export interface ReadConfigArgs {
  cliOptions?: OptionDefinition[];
  argv?: string[];
}

export async function readConfig(args: ReadConfigArgs = {}) {
  const { cliArgsConfig, cliArgs } = readCliArgs(args.cliOptions, args.argv);
  const fileConfig = await readFileConfig(cliArgs.config);
  const config: Partial<TestRunnerConfig> = {
    ...defaultBaseConfig,
    ...fileConfig,
    ...cliArgsConfig,
  };

  if (config.coverageConfig) {
    deepmerge(config.coverageConfig, defaultCoverageConfig);
  } else {
    config.coverageConfig = defaultCoverageConfig;
  }

  if (typeof config.port !== 'number') {
    const port = 9000 + Math.floor(Math.random() * 1000);
    config.port = await getPortPromise({ port });
  }

  return { cliArgs, config };
}

export async function startTestRunner(partialConfig: Partial<TestRunnerConfig>) {
  let config: TestRunnerConfig;
  try {
    config = validateConfig(partialConfig);
  } catch (error) {
    console.error(chalk.red(`\nFailed to start test runner: ${error.message}\n`));
    process.exit(1);
  }

  const testFiles = await collectTestFiles(
    Array.isArray(config.files) ? config.files : [config.files],
  );
  if (testFiles.length === 0) {
    console.error(`Could not find any files with pattern(s): ${config.files}`);
    process.exit(1);
  }

  const runner = new TestRunner(config, testFiles);
  const cli = new TestRunnerCli(config, runner);

  function stop() {
    runner.stop();
  }

  (['exit', 'SIGINT'] as NodeJS.Signals[]).forEach(event => {
    process.on(event, stop);
  });

  process.on('uncaughtException', error => {
    /* eslint-disable-next-line no-console */
    console.error(error);
    stop();
  });

  runner.on('quit', passed => {
    process.exit(passed ? 0 : 1);
  });

  await runner.start();
  await cli.start();
}
