import { v4 as uuid } from 'uuid';
import { DebugTestSession } from '../test-session/DebugTestSession';
import { TestSession } from '../test-session/TestSession';

export function createDebugSessions(sessions: TestSession[]): DebugTestSession[] {
  const debugSessions = [];

  for (const session of sessions) {
    const debugSession: DebugTestSession = {
      ...session,
      id: uuid(),
      debug: true,
    };

    debugSessions.push(debugSession);
  }

  return debugSessions;
}
