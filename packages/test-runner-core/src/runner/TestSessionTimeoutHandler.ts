import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig.js';
import { TestSessionManager } from '../test-session/TestSessionManager.js';
import { TestSession, TestResultError } from '../test-session/TestSession.js';
import { SESSION_STATUS } from '../test-session/TestSessionStatus.js';
import { TestScheduler } from './TestScheduler.js';

export class TestSessionTimeoutHandler {
  private timeoutIdsPerSession = new Map<string, NodeJS.Timeout[]>();
  private config: TestRunnerCoreConfig;
  private sessions: TestSessionManager;
  private scheduler: TestScheduler;

  constructor(
    config: TestRunnerCoreConfig,
    sessions: TestSessionManager,
    scheduler: TestScheduler,
  ) {
    this.config = config;
    this.sessions = sessions;
    this.scheduler = scheduler;
  }

  waitForTestsStarted(testRun: number, sessionId: string) {
    const timeoutId = setTimeout(() => {
      const session = this.sessions.get(sessionId)!;
      if (session.testRun !== testRun) {
        // session reloaded in the meantime
        return;
      }

      if (session.status === SESSION_STATUS.INITIALIZING) {
        this.setSessionFailed(session, {
          message:
            `Browser tests did not start after ${this.config.testsStartTimeout}ms ` +
            'You can increase this timeout with the testsStartTimeout option. ' +
            'Check the browser logs or open the browser in debug mode for more information.',
        });
        return;
      }
    }, this.config.testsStartTimeout);

    this.addTimeoutId(sessionId, timeoutId);
  }

  waitForTestsFinished(testRun: number, sessionId: string) {
    const timeoutId = setTimeout(() => {
      const session = this.sessions.get(sessionId)!;
      if (session.testRun !== testRun) {
        // session reloaded in the meantime
        return;
      }

      if (session.status !== SESSION_STATUS.TEST_FINISHED) {
        this.setSessionFailed(session, {
          message:
            `Browser tests did not finish within ${this.config.testsFinishTimeout}ms. ` +
            'You can increase this timeout with the testsFinishTimeout option. ' +
            'Check the browser logs or open the browser in debug mode for more information.',
        });
      }
    }, this.config.testsFinishTimeout);

    this.addTimeoutId(sessionId, timeoutId);
  }

  /**
   * Returns whether the session has gone stale. Sessions are immutable, this takes in a
   * snapshot of a session and returns whether the session has since changed test run or status.
   * This can be used to decide whether perform side effects like logging or changing status.
   */
  isStale(session: TestSession): boolean {
    const currentSession = this.sessions.get(session.id);
    return (
      !currentSession ||
      currentSession.testRun !== session.testRun ||
      currentSession.status !== session.status
    );
  }

  addTimeoutId(sessionId: string, id: any) {
    let timeoutIds = this.timeoutIdsPerSession.get(sessionId);
    if (!timeoutIds) {
      timeoutIds = [];
      this.timeoutIdsPerSession.set(sessionId, timeoutIds);
    }
    timeoutIds.push(id);
  }

  private setSessionFailed(session: TestSession, ...errors: TestResultError[]) {
    this.scheduler.stopSession(session, errors);
  }

  clearTimeoutsForSession(session: TestSession) {
    // the session is full finished, clear any related timeouts
    const timeoutIds = this.timeoutIdsPerSession.get(session.id);
    if (timeoutIds) {
      this.clearTimeouts(timeoutIds);
    }
  }

  clearAllTimeouts() {
    for (const ids of this.timeoutIdsPerSession.values()) {
      this.clearTimeouts(ids);
    }
  }

  clearTimeouts(timeoutIds: NodeJS.Timeout[]) {
    for (const id of timeoutIds) {
      clearTimeout(id);
    }
  }
}
