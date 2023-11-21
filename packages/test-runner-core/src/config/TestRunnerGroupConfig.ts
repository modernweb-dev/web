import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.js';
import { TestRunnerCoreConfig } from './TestRunnerCoreConfig.js';

export interface TestRunnerGroupConfig {
  name: string;
  configFilePath?: string;
  files?: string | string[];
  browsers?: BrowserLauncher[];
  testRunnerHtml?: (
    testRunnerImport: string,
    config: TestRunnerCoreConfig,
    group: TestRunnerGroupConfig,
  ) => string;
}
