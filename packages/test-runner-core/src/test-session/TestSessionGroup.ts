import { type BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { type TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { type TestRunnerGroupConfig } from '../config/TestRunnerGroupConfig';
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
