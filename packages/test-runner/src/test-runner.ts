#!/usr/bin/env node
import { TestRunnerConfig } from '@web/test-runner-core';
import { startTestRunner } from '@web/test-runner-cli';
import { createDevServer, DevServerConfig } from '@web/test-runner-dev-server';
import { chromeLauncher } from '@web/test-runner-chrome';
import commandLineArgs from 'command-line-args';
import { puppeteerLauncher, playwrightLauncher } from './loadLauncher';

const options: commandLineArgs.OptionDefinition[] = [
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

const args = commandLineArgs(options, { partial: true });
const devServerConfig: Partial<DevServerConfig> = {};
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

const defaultConfig: Partial<TestRunnerConfig> = {
  testFrameworkImport: '@web/test-runner-mocha',
  browsers,
  server: createDevServer(devServerConfig),
};

startTestRunner({ defaultConfig, argv: args._unknown ?? [] });
