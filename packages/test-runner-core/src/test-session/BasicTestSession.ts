import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.ts';
import { TestSessionGroup } from './TestSessionGroup.ts';

export interface BasicTestSession {
  id: string;
  group: TestSessionGroup;
  debug: boolean;
  browser: BrowserLauncher;
  testFile: string;
}
