import { TestSession } from './TestSession';
import { TestSessionStatus } from './TestSessionStatus';
import { EventEmitter } from '../utils/EventEmitter';
import { DebugTestSession } from './DebugTestSession';
import { TestSessionGroup } from './TestSessionGroup';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';

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
  private _groups: TestSessionGroup[];
  private sessionsMap = new Map<string, TestSession>();
  private debugSessions = new Map<string, DebugTestSession>();

  constructor(groups: TestSessionGroup[], sessions: TestSession[]) {
    super();
    this._groups = groups;
    for (const session of sessions) {
      this.sessionsMap.set(session.id, session);
    }
  }

  addDebug(...sessions: DebugTestSession[]) {
    for (const session of sessions) {
      this.debugSessions.set(session.id, session);
    }
  }

  updateStatus(session: TestSession, status: TestSessionStatus) {
    const updatedSession: TestSession = { ...session, status };
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

  groups() {
    return this._groups;
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

  forBrowser(browser: BrowserLauncher) {
    return this.filtered(s => s.browser === browser);
  }

  forGroup(groupName: string) {
    return this.filtered(s => s.group.name === groupName);
  }

  forBrowserName(browserName: string) {
    return this.filtered(s => s.browser.name === browserName);
  }

  forBrowserNames(browserNames: string[]) {
    return this.filtered(s => browserNames.includes(s.browser.name));
  }

  passed() {
    return this.filtered(s => s.passed);
  }

  failed() {
    return this.filtered(s => !s.passed);
  }

  getDebug(id: string) {
    return this.debugSessions.get(id);
  }

  getAllDebug() {
    return this.debugSessions.values();
  }

  setDebug(debugSession: DebugTestSession) {
    this.debugSessions.set(debugSession.id, debugSession);
  }

  removeDebug(id: string) {
    this.debugSessions.delete(id);
  }
}
