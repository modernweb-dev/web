#!/usr/bin/env node
import { TestRunnerConfig } from '@web/test-runner-core';
import { startTestRunner } from '@web/test-runner-cli';
import { createDevServer, DevServerConfig } from '@web/test-runner-dev-server';
import { chromeLauncher } from '@web/test-runner-chrome';
import commandLineArgs from 'command-line-args';

const options: commandLineArgs.OptionDefinition[] = [
  {
    name: 'root-dir',
    type: String,
  },
  {
    name: 'preserve-symlinks',
    type: Boolean,
  },
];

const args = commandLineArgs(options, { partial: true });
const devServerConfig: Partial<DevServerConfig> = {};

if ('root-dir' in args) {
  devServerConfig.rootDir = args['root-dir'];
}

if ('preserve-symlinks' in args) {
  devServerConfig.preserveSymlinks = !!args['preserve-symlinks'];
}

const defaultConfig: Partial<TestRunnerConfig> = {
  testFrameworkImport: '@web/test-runner-mocha',
  browsers: chromeLauncher(),
  server: createDevServer(devServerConfig),
};

startTestRunner({ defaultConfig, argv: args._unknown ?? [] });
