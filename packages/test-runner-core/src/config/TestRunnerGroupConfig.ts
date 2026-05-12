import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.ts';
import { TestRunnerCoreConfig } from './TestRunnerCoreConfig.ts';

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
