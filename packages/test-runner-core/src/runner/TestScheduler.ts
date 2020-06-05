import { TestSessionManager } from '../test-session/TestSessionManager';
import { TestSession } from '../test-session/TestSession';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { SESSION_STATUS } from '../test-session/TestSessionStatus';
import { TestResultError } from '../test-session/TestSessionResult';

export interface TestSchedulerConfig {
  concurrency?: number;
  browserStartTimeout?: number;
  sessionStartTimeout?: number;
  sessionFinishTimeout?: number;
}

export class TestScheduler {
  constructor(
    private config: TestSchedulerConfig,
    private browsers: BrowserLauncher[],
    private sessions: TestSessionManager,
  ) {}

  async schedule(testRun: number, sessionsToSchedule: Iterable<TestSession>) {
    for (const session of sessionsToSchedule) {
      this.sessions.updateStatus(session, SESSION_STATUS.SCHEDULED);
    }

    return this.runScheduled(testRun);
  }

  runScheduled(testRun: number): Promise<void[]> {
    const scheduleTasks: Promise<void>[] = [];
    const scheduledIt = this.sessions.forStatus(SESSION_STATUS.SCHEDULED);
    const runningCount = Array.from(
      this.sessions.forStatus(SESSION_STATUS.INITIALIZING, SESSION_STATUS.STARTED),
    ).length;
    const count = this.config.concurrency! - runningCount;

    for (let i = 0; i < count; i += 1) {
      const { done, value } = scheduledIt.next();
      if (done || !value) {
        break;
      }

      scheduleTasks.push(this.runSession(testRun, value));
    }

    return Promise.all(scheduleTasks);
  }

  private async runSession(testRun: number, session: TestSession) {
    this.sessions.update({ ...session, testRun, status: SESSION_STATUS.INITIALIZING });
    let browserStartResponded = false;

    // browser should be started within the specified milliseconds
    setTimeout(() => {
      if (!browserStartResponded) {
        this.setSessionFailed(this.sessions.get(session.id)!, {
          message: `Browser did not start after ${this.config.browserStartTimeout}ms.`,
        });
      }
    }, this.config.browserStartTimeout);

    try {
      // TODO: Select associated browser
      await this.browsers[0]!.startSession(session);

      // when the browser started, wait for session to ping back on time
      this.setSessionStartedTimeout(testRun, session.id);
    } catch (error) {
      this.setSessionFailed(session, error);
    } finally {
      browserStartResponded = true;
    }
  }

  private setSessionFailed(session: TestSession, error: TestResultError) {
    this.sessions.updateStatus(session, SESSION_STATUS.FINISHED, { passed: false, error });
  }

  private setSessionStartedTimeout(testRun: number, sessionId: string) {
    setTimeout(() => {
      const session = this.sessions.get(sessionId)!;
      if (session.testRun !== testRun) {
        // session reloaded in the meantime
        return;
      }

      if (session.status === SESSION_STATUS.INITIALIZING) {
        this.setSessionFailed(session, {
          message: `Did not receive a start signal from browser after ${this.config.sessionStartTimeout}ms.`,
        });
        return;
      }

      if (session.status === SESSION_STATUS.FINISHED) {
        // The session finished by now
        return;
      }

      this.setSessionFinishedTimeout(testRun, session.id);
    }, this.config.sessionStartTimeout);
  }

  private setSessionFinishedTimeout(testRun: number, sessionId: string) {
    setTimeout(() => {
      const session = this.sessions.get(sessionId)!;
      if (session.testRun !== testRun) {
        // session reloaded in the meantime
        return;
      }

      if (session.status !== SESSION_STATUS.FINISHED) {
        this.setSessionFailed(session, {
          message: `Browser did not finish within ${this.config.sessionStartTimeout}ms.`,
        });
      }
    }, this.config.sessionFinishTimeout!);
  }
}
