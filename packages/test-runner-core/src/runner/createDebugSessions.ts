import { v4 as uuid } from 'uuid';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { DebugTestSession } from '../test-session/DebugTestSession';

export function createDebugSessions(
  browserNameForLauncher: Map<BrowserLauncher, string>,
  testFile: string,
): DebugTestSession[] {
  const sessions = [];

  for (const [browserLauncher, browserName] of browserNameForLauncher) {
    const session: DebugTestSession = {
      id: uuid(),
      testFile,
      debug: true,
      browserName,
      browserLauncher,
    };

    sessions.push(session);
  }

  return sessions;
}
