import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';

export interface BasicTestSession {
  id: string;
  group: { name: string };
  debug: boolean;
  browser: BrowserLauncher;
  testFile: string;
}
