import { createSessionUrl } from './createSessionUrl';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { TestSessionManager } from '../test-session/TestSessionManager';
import { TestSession, TestResultError } from '../test-session/TestSession';
import { SESSION_STATUS } from '../test-session/TestSessionStatus';

export class TestScheduler {
  private timeoutIdsPerSession = new Map<string, NodeJS.Timeout[]>();

  constructor(private config: TestRunnerCoreConfig, private sessions: TestSessionManager) {
    sessions.on('session-status-updated', session => {
      if (session.status === SESSION_STATUS.TEST_FINISHED) {
        this.stopSession(session);
        return;
      }

      const timeoutIds = this.timeoutIdsPerSession.get(session.id);
      if (timeoutIds && session.status === SESSION_STATUS.FINISHED) {
        this.clearTimeouts(timeoutIds);
      }
    });
  }

  stop() {
    for (const ids of this.timeoutIdsPerSession.values()) {
      this.clearTimeouts(ids);
    }
  }

  private addTimeoutId(sessionId: string, id: NodeJS.Timeout) {
    let timeoutIds = this.timeoutIdsPerSession.get(sessionId);
    if (!timeoutIds) {
      timeoutIds = [];
      this.timeoutIdsPerSession.set(sessionId, timeoutIds);
    }
    timeoutIds.push(id);
  }

  private clearTimeouts(timeoutIds: NodeJS.Timeout[]) {
    for (const id of timeoutIds) {
      clearTimeout(id);
    }
  }

  schedule(testRun: number, sessionsToSchedule: Iterable<TestSession>) {
    for (const session of sessionsToSchedule) {
      this.sessions.updateStatus({ ...session, request404s: [] }, SESSION_STATUS.SCHEDULED);
    }

    this.runScheduled(testRun);
  }

  runScheduled(testRun: number) {
    const scheduledIt = this.sessions.forStatus(SESSION_STATUS.SCHEDULED);
    const runningCount = Array.from(
      this.sessions.forStatus(
        SESSION_STATUS.INITIALIZING,
        SESSION_STATUS.TEST_STARTED,
        SESSION_STATUS.TEST_FINISHED,
      ),
    ).length;
    const count = this.config.concurrency! - runningCount;

    for (let i = 0; i < count; i += 1) {
      const { done, value } = scheduledIt.next();
      if (done || !value) {
        break;
      }

      this.startSession(testRun, value);
    }
  }

  private async startSession(testRun: number, session: TestSession) {
    this.sessions.update({ ...session, testRun, status: SESSION_STATUS.INITIALIZING });
    let browserStartResponded = false;

    // browser should be started within the specified milliseconds
    const timeoutId = setTimeout(() => {
      if (!browserStartResponded) {
        this.setSessionFailed(this.sessions.get(session.id)!, {
          message: `The browser was unable to open the test page after ${this.config.browserStartTimeout}ms.`,
        });
      }
    }, this.config.browserStartTimeout!);
    this.addTimeoutId(session.id, timeoutId);

    try {
      await session.browserLauncher.startSession(
        session,
        createSessionUrl(this.config, session, false),
      );

      // when the browser started, wait for session to ping back on time
      this.setSessionStartedTimeout(testRun, session.id);
    } catch (error) {
      this.setSessionFailed(session, error);
    } finally {
      browserStartResponded = true;
    }
  }

  private setSessionFailed(session: TestSession, ...errors: TestResultError[]) {
    this.stopSession(session, errors);
  }

  private setSessionStartedTimeout(testRun: number, sessionId: string) {
    const timeoutId = setTimeout(() => {
      const session = this.sessions.get(sessionId)!;
      if (session.testRun !== testRun) {
        // session reloaded in the meantime
        return;
      }

      if (session.status === SESSION_STATUS.INITIALIZING) {
        this.setSessionFailed(session, {
          message: `Browser tests did not start after ${this.config.sessionStartTimeout}ms. Check the browser logs or open the browser in debug mode for more information.`,
        });
        return;
      }

      if ([SESSION_STATUS.TEST_FINISHED, SESSION_STATUS.FINISHED].includes(session.status)) {
        // The session finished by now
        return;
      }

      this.setSessionFinishedTimeout(testRun, session.id);
    }, this.config.sessionStartTimeout!);

    this.addTimeoutId(sessionId, timeoutId);
  }

  private setSessionFinishedTimeout(testRun: number, sessionId: string) {
    const timeoutId = setTimeout(() => {
      const session = this.sessions.get(sessionId)!;
      if (session.testRun !== testRun) {
        // session reloaded in the meantime
        return;
      }

      if (session.status !== SESSION_STATUS.FINISHED) {
        this.setSessionFailed(session, {
          message: `Browser tests did not finish within ${this.config.sessionStartTimeout}ms. Check the browser logs or open the browser in debug mode for more information.`,
        });
      }
    }, this.config.sessionFinishTimeout!);

    this.addTimeoutId(sessionId, timeoutId);
  }

  async stopSession(session: TestSession, errors: TestResultError[] = []) {
    const { testCoverage, browserLogs: logs } = await session.browserLauncher.stopSession(session);
    const updatedSession = { ...session, testCoverage, logs };
    if (errors.length > 0) {
      // merge with existing erors
      updatedSession.errors = [...(updatedSession.errors ?? []), ...errors];
      updatedSession.passed = false;
    }
    this.sessions.updateStatus(updatedSession, SESSION_STATUS.FINISHED);
  }
}
