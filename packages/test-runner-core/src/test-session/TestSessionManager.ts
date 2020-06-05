import { TestSession } from './TestSession';
import { TestSessionStatus } from './TestSessionStatus';
import { TestSessionResult } from './TestSessionResult';
import { EventEmitter } from '../utils/EventEmitter';

interface EventMap {
  'session-status-updated': TestSession;
  'session-updated': void;
}

function* filtered<T>(it: Iterator<T>, filter: (value: T) => unknown) {
  while (true) {
    const { value, done } = it.next();
    if (done) return;
    if (filter(value)) yield value as T;
  }
}

export class TestSessionManager extends EventEmitter<EventMap> {
  private sessionsMap = new Map<string, TestSession>();

  add(session: TestSession) {
    this.sessionsMap.set(session.id, session);
  }

  updateStatus(
    session: TestSession,
    status: TestSessionStatus,
    result: Partial<TestSessionResult> = {},
  ) {
    const updatedSession: TestSession = {
      ...session,
      status,
      result: {
        passed: false,
        logs: [],
        tests: [],
        failedImports: [],
        request404s: new Set(),
        error: undefined,
        ...result,
      },
    };
    this.update(updatedSession);
    this.emit('session-status-updated', updatedSession);
  }

  update(session: TestSession) {
    if (!this.sessionsMap.has(session.id)) {
      throw new Error(`Unknown session: ${session.id}`);
    }
    this.sessionsMap.set(session.id, session);
    this.emit('session-updated', undefined);
  }

  get(id: string) {
    return this.sessionsMap.get(id);
  }

  all() {
    return this.sessionsMap.values();
  }

  filtered(filter: (s: TestSession) => unknown) {
    return filtered(this.all(), filter);
  }

  forStatus(...statuses: TestSessionStatus[]) {
    return this.filtered(s => statuses.includes(s.status));
  }

  forStatusAndTestFile(testFile?: string, ...statuses: TestSessionStatus[]) {
    return this.filtered(
      s => statuses.includes(s.status) && (!testFile || s.testFile === testFile),
    );
  }

  forTestFile(...testFiles: string[]) {
    return this.filtered(s => testFiles.includes(s.testFile));
  }

  forBrowser(...browserNames: string[]) {
    return this.filtered(s => browserNames.includes(s.browserName));
  }

  forBrowserAndTestFile(testFile?: string, ...browserNames: string[]) {
    return this.filtered(
      s => browserNames.includes(s.browserName) && (!testFile || s.testFile === testFile),
    );
  }

  passed() {
    return this.filtered(s => s.result?.passed);
  }

  failed() {
    return this.filtered(s => !s.result?.passed);
  }
}
