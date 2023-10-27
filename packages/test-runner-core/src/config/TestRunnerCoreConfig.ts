import { Middleware } from '@web/dev-server-core';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.js';
import { TestFramework } from '../test-framework/TestFramework.js';
import { TestSession } from '../test-session/TestSession.js';
import { Reporter } from '../reporter/Reporter.js';
import { Logger } from '../logger/Logger.js';
import { TestRunnerPlugin } from '../server/TestRunnerPlugin.js';
import { ReportType } from 'istanbul-reports';

export interface CoverageThresholdConfig {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface CoverageConfig {
  include?: string[];
  exclude?: string[];
  nativeInstrumentation?: boolean;
  threshold?: CoverageThresholdConfig;
  report?: boolean;
  reportDir?: string;
  reporters?: ReportType[];
}

export interface TestRunnerCoreConfig {
  rootDir: string;
  files?: string | string[];
  concurrentBrowsers: number;
  concurrency: number;

  protocol: string;
  hostname: string;
  port: number;

  http2?: boolean;
  sslKey?: string;
  sslCert?: string;

  browsers: BrowserLauncher[];
  testFramework?: TestFramework;
  logger: Logger;
  reporters: Reporter[];

  testRunnerHtml?: (testRunnerImport: string, config: TestRunnerCoreConfig) => string;
  watch: boolean;

  browserLogs?: boolean;
  filterBrowserLogs?: (
    log: { type: string; args: any[] },
    session?: Partial<TestSession>,
  ) => boolean;
  coverage?: boolean;
  coverageConfig: CoverageConfig;

  browserStartTimeout: number;
  testsStartTimeout: number;
  testsFinishTimeout: number;
  staticLogging?: boolean;

  /** Ignores browsers option and prints manual testing URL. */
  manual?: boolean;
  /** Opens browser for manual testing. Requires the manual option to be set. */
  open?: boolean;

  debug?: boolean;
  mimeTypes?: Record<string, string>;
  plugins?: TestRunnerPlugin[];
  middleware?: Middleware[];
}
