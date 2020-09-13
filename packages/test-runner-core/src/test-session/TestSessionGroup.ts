import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';
export interface TestSessionGroup {
  name: string;
  testFiles: string[];
  browsers: BrowserLauncher[];
  sessionIds: string[];
}
