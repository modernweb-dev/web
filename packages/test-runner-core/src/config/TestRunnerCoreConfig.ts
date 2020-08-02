import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.js';
import { TestFramework } from '../test-framework/TestFramework.js';
import { Reporter } from '../reporter/Reporter.js';
import { Server } from '../server/Server.js';
import { Logger } from '../logger/Logger.js';

export interface CoverageThresholdConfig {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface CoverageConfig {
  include?: string[];
  exclude?: string[];
  threshold?: CoverageThresholdConfig;
  report: boolean;
  reportDir: string;
}

export type LogLevel = 'log' | 'warn' | 'error' | 'debug';

export interface TestRunnerCoreConfig {
  rootDir: string;
  files: string | string[];
  concurrency?: number;

  protocol: string;
  hostname: string;
  port: number;

  browsers: BrowserLauncher[];
  testFramework?: TestFramework;
  logger: Logger;
  reporters: Reporter[];
  server: Server;

  testRunnerHtml?: (testRunnerImport: string, config: TestRunnerCoreConfig) => string;
  watch: boolean;

  logBrowserLogs?: boolean | LogLevel[];
  logUncaughtErrors?: boolean;
  coverage?: boolean;
  coverageConfig?: CoverageConfig;

  browserStartTimeout?: number;
  testsStartTimeout?: number;
  testsFinishTimeout?: number;
  staticLogging?: boolean;
}
