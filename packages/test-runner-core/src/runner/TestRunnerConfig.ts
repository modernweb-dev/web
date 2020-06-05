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
}

export interface TestRunnerConfig {
  files: string | string[];
  testFrameworkImport: string;
  browsers: BrowserLauncher | BrowserLauncher[];
  server: Server;
  address: string;
  port: number;
  testRunnerHtml?: (config: TestRunnerConfig) => string;
  watch?: boolean;
  coverage?: boolean | CoverageConfig;
  concurrency?: number;
  browserStartTimeout?: number;
  sessionStartTimeout?: number;
  sessionFinishTimeout?: number;
  staticLogging?: boolean;
}
