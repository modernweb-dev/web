import { v4 as uuid } from 'uuid';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { DebugTestSession } from '../test-session/DebugTestSession';

export function createDebugSessions(
  browsers: BrowserLauncher[],
  testFile: string,
): DebugTestSession[] {
  const sessions = [];

  for (const browser of browsers) {
    const session: DebugTestSession = {
      id: uuid(),
      testFile,
      debug: true,
      browser,
    };

    sessions.push(session);
  }

  return sessions;
}
