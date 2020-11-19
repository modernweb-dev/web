import { getPortPromise } from 'portfinder';
import { TestRunnerCoreConfig, CoverageConfig } from '@web/test-runner-core';
import { readConfig as readFileConfig, ConfigLoaderError } from '@web/config-loader';
import deepmerge from 'deepmerge';
import chalk from 'chalk';
import path from 'path';
import { cpus } from 'os';
import { TestRunnerLogger } from '../logger/TestRunnerLogger';

const secondMs = 1000;
const minuteMs = secondMs * 60;

const defaultBaseConfig: Partial<TestRunnerCoreConfig> = {
  watch: false,
  rootDir: process.cwd(),
  protocol: 'http:',
  hostname: 'localhost',
  concurrentBrowsers: 2,
  concurrency: Math.max(1, cpus().length / 2),
  browserStartTimeout: minuteMs / 2,
  testsStartTimeout: secondMs * 20,
  testsFinishTimeout: minuteMs * 2,
  browserLogs: true,
};

const defaultCoverageConfig: CoverageConfig = {
  exclude: ['**/node_modules/**/*', '**/web_modules/**/*'],
  threshold: { statements: 0, functions: 0, branches: 0, lines: 0 },
  report: true,
  reportDir: 'coverage',
};

export function validateCoreConfig<T extends TestRunnerCoreConfig>(config: Partial<T>): T {
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
  cliArgsConfig: Partial<T> = {},
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

    if (!config.logger) {
      config.logger = new TestRunnerLogger(!!cliArgsConfig.debug);
    }

    if (typeof config.rootDir === 'string') {
      config.rootDir = path.resolve(config.rootDir);
    }

    if (config.coverageConfig) {
      config.coverageConfig = deepmerge(defaultCoverageConfig, config.coverageConfig!);
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
