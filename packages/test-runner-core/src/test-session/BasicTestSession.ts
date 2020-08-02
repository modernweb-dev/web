import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';

export interface BasicTestSession {
  id: string;
  debug: boolean;
  browser: BrowserLauncher;
  testFile: string;
}
