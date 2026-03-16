import { type BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { type TestSessionGroup } from './TestSessionGroup.ts';
export interface BasicTestSession {
  id: string;
  group: TestSessionGroup;
  debug: boolean;
  browser: BrowserLauncher;
  testFile: string;
}
