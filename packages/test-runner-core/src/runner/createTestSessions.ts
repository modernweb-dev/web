import { v4 as uuid } from 'uuid';
import { SESSION_STATUS } from '../test-session/TestSessionStatus';
import { TestSession } from '../test-session/TestSession';

export function createTestSessions(browserNames: string[], testFiles: string[]): TestSession[] {
  const sessions = [];

  // when running each test files in a separate tab, we group tests by file
  for (const testFile of testFiles) {
    const group = testFile;
    const sessionsForFile = browserNames.map(browserName => ({
      id: uuid(),
      testRun: -1,
      group,
      browserName,
      status: SESSION_STATUS.SCHEDULED,
      testFile,
    }));

    for (const session of sessionsForFile) {
      sessions.push(session);
    }
  }

  return sessions;
}
