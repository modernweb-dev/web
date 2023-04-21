import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { TestRunnerCoreConfig } from './TestRunnerCoreConfig';

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
