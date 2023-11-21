import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.js';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig.js';
import { TestRunnerGroupConfig } from '../config/TestRunnerGroupConfig.js';

export interface TestSessionGroup {
  name: string;
  testFiles: string[];
  browsers: BrowserLauncher[];
  sessionIds: string[];
  testRunnerHtml?: (
    testRunnerImport: string,
    config: TestRunnerCoreConfig,
    group: TestRunnerGroupConfig,
  ) => string;
}
