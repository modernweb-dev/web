import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';

export interface BasicTestSession {
  id: string;
  debug: boolean;
  browserLauncher: BrowserLauncher;
  browserName: string;
  testFile: string;
}
