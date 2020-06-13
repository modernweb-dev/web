#!/usr/bin/env node
import { TestRunnerConfig as BaseTestRunnerConfig } from '@web/test-runner-core';
import { readConfig, startTestRunner } from '@web/test-runner-cli';
import { testRunnerServer, ServerConfig } from '@web/test-runner-server';
import { chromeLauncher } from '@web/test-runner-chrome';
import commandLineArgs from 'command-line-args';
import { puppeteerLauncher, playwrightLauncher } from './loadLauncher';

export interface TestRunnerConfig extends BaseTestRunnerConfig {
  devServer: ServerConfig;
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

  const devServerConfig: Partial<ServerConfig> = partialConfig.devServer ?? {};
  let browsers = chromeLauncher();

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
    testFrameworkImport: '@web/test-runner-mocha/autorun.js',
    browsers,
    server: testRunnerServer(devServerConfig),
  };

  // sync dev server and test runner root dir
  config.rootDir = devServerConfig.rootDir;

  // root dir from args takes priority
  if ('root-dir' in args) {
    config.rootDir = args['root-dir'];
  }

  startTestRunner(config);
})();
