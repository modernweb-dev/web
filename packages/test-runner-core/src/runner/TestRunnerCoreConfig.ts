import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.js';
import { Server } from '../server/Server.js';

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

export interface TestRunnerCoreConfig {
  files: string | string[];
  testFramework: string;
  browsers: BrowserLauncher | BrowserLauncher[];
  server: Server;
  protocol: string;
  hostname: string;
  port: number;
  rootDir: string;
  testRunnerHtml?: (testRunnerImport: string, config: TestRunnerCoreConfig) => string;
  watch: boolean;
  coverage?: boolean;
  coverageConfig?: CoverageConfig;
  concurrency?: number;
  browserStartTimeout?: number;
  sessionStartTimeout?: number;
  sessionFinishTimeout?: number;
  staticLogging?: boolean;
}
