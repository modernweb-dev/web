import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.js';
import { TestSessionGroup } from './TestSessionGroup.js';

export interface BasicTestSession {
  id: string;
  group: TestSessionGroup;
  debug: boolean;
  browser: BrowserLauncher;
  testFile: string;
}
