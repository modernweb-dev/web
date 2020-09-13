import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { TestSessionGroup } from './TestSessionGroup';

export interface BasicTestSession {
  id: string;
  group: TestSessionGroup;
  debug: boolean;
  browser: BrowserLauncher;
  testFile: string;
}
