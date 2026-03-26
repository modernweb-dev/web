import { nanoid } from 'nanoid';
import { type DebugTestSession } from '../test-session/DebugTestSession.ts';
import { type TestSession } from '../test-session/TestSession.ts';
export function createDebugSessions(sessions: TestSession[]): DebugTestSession[] {
  const debugSessions = [];

  for (const session of sessions) {
    const debugSession: DebugTestSession = {
      ...session,
      id: nanoid(),
      debug: true,
    };

    debugSessions.push(debugSession);
  }

  return debugSessions;
}
