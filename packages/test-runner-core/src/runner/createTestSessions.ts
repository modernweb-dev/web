import { v4 as uuid } from 'uuid';
import { SESSION_STATUS } from '../test-session/TestSessionStatus';
import { TestSession } from '../test-session/TestSession';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';

export function createTestSessions(
  browsers: BrowserLauncher[],
  testFiles: string[],
): TestSession[] {
  const sessions = [];

  for (const testFile of testFiles) {
    for (const browser of browsers) {
      const session: TestSession = {
        id: uuid(),
        debug: false,
        testRun: -1,
        browser,
        status: SESSION_STATUS.SCHEDULED,
        testFile,
        errors: [],
        logs: [],
        request404s: [],
      };

      sessions.push(session);
    }
  }

  return sessions;
}
