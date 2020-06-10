import { getPortPromise } from 'portfinder';
import { TestRunner, TestRunnerConfig, CoverageConfig } from '@web/test-runner-core';
import { TestRunnerCli } from './TestRunnerCli';
import { collectTestFiles } from './config/collectTestFiles';
import { readFileConfig } from '../js/readFileConfig';
import { readCliArgs } from './config/readCliArgs';
import { OptionDefinition } from 'command-line-args';

const defaultBaseConfig: Partial<TestRunnerConfig> = {
  watch: false,
  address: 'http://localhost',
  port: 9542,
  concurrency: 10,
  browserStartTimeout: 30000,
  sessionStartTimeout: 10000,
  sessionFinishTimeout: 20000,
};

const defaultCoverageConfig: CoverageConfig = {
  exclude: ['**/node_modules/**/*'],
  threshold: {
    statements: 60,
    functions: 60,
    branches: 60,
    lines: 60,
  },
  report: true,
  reportDir: 'coverage',
};

function validateConfig(config: Partial<TestRunnerConfig>): config is TestRunnerConfig {
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

  return true;
}

export interface ReadConfigArgs {
  cliOptions?: OptionDefinition[];
  argv?: string[];
}

export async function readConfig(args: ReadConfigArgs = {}) {
  const fileConfig = await readFileConfig();
  const { cliArgsConfig, cliArgs } = readCliArgs(args.cliOptions, args.argv);
  const config: Partial<TestRunnerConfig> = {
    ...defaultBaseConfig,
    ...fileConfig,
    ...cliArgsConfig,
  };

  if (config.coverage === true) {
    config.coverage = defaultCoverageConfig;
  }

  if (typeof config.port !== 'number') {
    const port = 9000 + Math.floor(Math.random() * 1000);
    config.port = await getPortPromise({ port });
  }

  return { cliArgs, config };
}

export async function startTestRunner(config: Partial<TestRunnerConfig>) {
  if (!validateConfig(config)) {
    throw new Error('Invalid config');
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
