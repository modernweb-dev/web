import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';

export interface TestRunnerGroupConfig {
  name: string;
  configFilePath?: string;
  files?: string | string[];
  browsers?: BrowserLauncher[];
}
