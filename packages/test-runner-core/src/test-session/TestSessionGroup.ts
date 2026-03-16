import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.ts';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig.ts';
import { TestRunnerGroupConfig } from '../config/TestRunnerGroupConfig.ts';

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
