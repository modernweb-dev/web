import { nanoid } from 'nanoid';
import { DebugTestSession } from '../test-session/DebugTestSession';
import { TestSession } from '../test-session/TestSession';

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
