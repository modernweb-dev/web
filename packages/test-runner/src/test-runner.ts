#!/usr/bin/env node
import { TestRunnerConfig as BaseTestRunnerConfig } from '@web/test-runner-core';
import { readConfig, startTestRunner } from '@web/test-runner-cli';
import { createDevServer, DevServerConfig } from '@web/test-runner-dev-server';
import { chromeLauncher } from '@web/test-runner-chrome';
import commandLineArgs from 'command-line-args';
import { puppeteerLauncher, playwrightLauncher } from './loadLauncher';

export interface TestRunnerConfig extends BaseTestRunnerConfig {
  devServer: DevServerConfig;
}

const cliOptions: commandLineArgs.OptionDefinition[] = [
  {
    name: 'root-dir',
    type: String,
  },
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
];

(async () => {
  const result = await readConfig({ cliOptions });
  const args = result.cliArgs;
  const partialConfig = result.config as TestRunnerConfig;

  const devServerConfig: Partial<DevServerConfig> = partialConfig.devServer ?? {};
  let browsers = chromeLauncher();

  if ('root-dir' in args) {
    devServerConfig.rootDir = args['root-dir'];
  }

  if ('preserve-symlinks' in args) {
    devServerConfig.preserveSymlinks = !!args['preserve-symlinks'];
  }

  if (args.puppeteer) {
    browsers = puppeteerLauncher();
  }

  if (args.playwright) {
    browsers = playwrightLauncher(args.browsers ?? ['chromium']);
  }

  const config: Partial<TestRunnerConfig> = {
    ...partialConfig,
    testFrameworkImport: '@web/test-runner-mocha',
    browsers,
    server: createDevServer(devServerConfig),
  };

  startTestRunner(config);
})();
