import { getPortPromise } from 'portfinder';
import { TestRunnerCoreConfig, CoverageConfig } from '@web/test-runner-core';
import { readConfig as readFileConfig, ConfigLoaderError } from '@web/config-loader';
import deepmerge from 'deepmerge';
import chalk from 'chalk';
import path from 'path';

const defaultBaseConfig: Partial<TestRunnerCoreConfig> = {
  watch: false,
  rootDir: process.cwd(),
  protocol: 'http:',
  hostname: 'localhost',
  concurrency: 10,
  browserStartTimeout: 30000,
  sessionStartTimeout: 10000,
  sessionFinishTimeout: 20000,
};

const defaultCoverageConfig: CoverageConfig = {
  exclude: ['**/node_modules/**/*'],
  threshold: { statements: 0, functions: 0, branches: 0, lines: 0 },
  report: true,
  reportDir: 'coverage',
};

export function validateCoreConfig<T extends TestRunnerCoreConfig>(config: Partial<T>): T {
  if (
    !(typeof config.files === 'string' || Array.isArray(config.files)) ||
    config.files.length === 0
  ) {
    throw new Error('No test files configured.');
  }
  if (typeof config.testFramework !== 'string') {
    throw new Error('No testFramework specified.');
  }
  if (!config.browsers) {
    throw new Error('No browsers specified.');
  }
  if (!config.server) {
    throw new Error('No server specified.');
  }
  if (typeof config.protocol !== 'string') {
    throw new Error('No protocol specified.');
  }
  if (typeof config.hostname !== 'string') {
    throw new Error('No hostnames specified.');
  }
  if (typeof config.port !== 'number') {
    throw new Error('No port specified.');
  }
  if (typeof config.rootDir !== 'string') {
    throw new Error('No rootDir specified.');
  }

  return config as T;
}

export async function readConfig<T extends TestRunnerCoreConfig & { config?: string }>(
  cliArgsConfig: Partial<T>,
): Promise<Partial<T>> {
  try {
    const fileConfig = await readFileConfig(
      'web-test-runner.config',
      typeof cliArgsConfig.config === 'string' ? cliArgsConfig.config : undefined,
    );
    const config: Partial<T> = {
      ...defaultBaseConfig,
      ...fileConfig,
      ...cliArgsConfig,
    };

    if (typeof config.rootDir === 'string') {
      config.rootDir = path.resolve(config.rootDir);
    }

    if (config.coverageConfig) {
      config.coverageConfig = deepmerge(config.coverageConfig!, defaultCoverageConfig);
    } else {
      config.coverageConfig = defaultCoverageConfig;
    }

    if (typeof config.port !== 'number') {
      const port = 9000 + Math.floor(Math.random() * 1000);
      config.port = await getPortPromise({ port });
    }

    return config;
  } catch (error) {
    if (error instanceof ConfigLoaderError) {
      console.error(chalk.red(`\n${error.message}\n`));
      process.exit(1);
    }
    throw error;
  }
}
