import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { TestRunnerGroupConfig } from '../config/TestRunnerGroupConfig';

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
