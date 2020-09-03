import { createSessionUrl } from './createSessionUrl';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { TestSessionManager } from '../test-session/TestSessionManager';
import { TestSession, TestResultError } from '../test-session/TestSession';
import { SESSION_STATUS } from '../test-session/TestSessionStatus';
import { withTimeout } from '../utils/async';

export class TestScheduler {
  private timeoutIdsPerSession = new Map<string, NodeJS.Timeout[]>();

  constructor(private config: TestRunnerCoreConfig, private sessions: TestSessionManager) {
    sessions.on('session-status-updated', async session => {
      if (session.status === SESSION_STATUS.TEST_STARTED) {
        this.waitForTestsFinished(session.testRun, session.id);
        return;
      }

      if (session.status === SESSION_STATUS.TEST_FINISHED) {
        // the session finished executing tests, close the browser page
        await this.stopSession(session);
        return;
      }

      if (session.status === SESSION_STATUS.FINISHED) {
        // the session is full finished, clear any related timeouts
        const timeoutIds = this.timeoutIdsPerSession.get(session.id);
        if (timeoutIds) {
          this.clearTimeouts(timeoutIds);
        }
        this.runNextScheduled();
      }
    });
  }

  /**
   * Schedules a session for execution. Execution is batched, the session
   * will be queued until there is a browser page available.
   */
  schedule(testRun: number, sessionsToSchedule: Iterable<TestSession>) {
    for (const session of sessionsToSchedule) {
      this.sessions.updateStatus(
        { ...session, testRun, request404s: [] },
        SESSION_STATUS.SCHEDULED,
      );
    }
    this.runNextScheduled();
  }

  stop() {
    for (const ids of this.timeoutIdsPerSession.values()) {
      this.clearTimeouts(ids);
    }
  }

  /** Runs the next batch of scheduled sessions, if any. */
  private runNextScheduled() {
    const runningCount = Array.from(
      this.sessions.forStatus(
        SESSION_STATUS.INITIALIZING,
        SESSION_STATUS.TEST_STARTED,
        SESSION_STATUS.TEST_FINISHED,
      ),
    ).length;
    const count = this.config.concurrency! - runningCount;
    if (count === 0) {
      return;
    }

    const scheduled = Array.from(this.sessions.forStatus(SESSION_STATUS.SCHEDULED)).slice(0, count);
    for (const session of scheduled) {
      this.startSession(session);
    }
  }

  private async startSession(session: TestSession) {
    const updatedSession = { ...session, status: SESSION_STATUS.INITIALIZING };
    this.sessions.update(updatedSession);
    let browserStarted = false;

    // browser should be started within the specified milliseconds
    const timeoutId = setTimeout(() => {
      if (!browserStarted && !this.isStale(updatedSession)) {
        this.setSessionFailed(this.sessions.get(updatedSession.id)!, {
          message: `The browser was unable to open the test page after ${this.config.browserStartTimeout}ms.`,
        });
      }
    }, this.config.browserStartTimeout!);
    this.addTimeoutId(updatedSession.id, timeoutId);

    try {
      await withTimeout(
        updatedSession.browser.startSession(
          updatedSession.id,
          createSessionUrl(this.config, updatedSession),
        ),
        'Timeout starting the browser page.',
        this.config.browserStartTimeout!,
      );

      // when the browser started, wait for session to ping back on time
      this.waitForTestsStarted(updatedSession.testRun, updatedSession.id);
    } catch (error) {
      if (this.isStale(updatedSession)) {
        // something else has changed the test session, such as a the browser timeout
        // or a re-run in watch mode. in that was we just log the error
        this.config.logger.error(error);
      } else {
        this.setSessionFailed(updatedSession, { message: error.message, stack: error.stack });
      }
    } finally {
      browserStarted = true;
    }
  }

  private setSessionFailed(session: TestSession, ...errors: TestResultError[]) {
    this.stopSession(session, errors);
  }

  async stopSession(session: TestSession, errors: TestResultError[] = []) {
    if (this.isStale(session)) {
      return;
    }
    const sessionErrors = [...errors];
    const updatedSession = { ...session };

    try {
      if (session.browser.isActive(session.id)) {
        const { testCoverage, browserLogs } = await withTimeout(
          session.browser.stopSession(session.id),
          'Timed out stopping the browser page',
          this.config.testsFinishTimeout!,
        );
        updatedSession.testCoverage = testCoverage;
        updatedSession.logs = browserLogs;
      }
    } catch (error) {
      sessionErrors.push(error);
    } finally {
      if (sessionErrors.length > 0) {
        // merge with existing erors
        updatedSession.errors = [...(updatedSession.errors ?? []), ...sessionErrors];
        updatedSession.passed = false;
      }
      this.sessions.updateStatus(updatedSession, SESSION_STATUS.FINISHED);
    }
  }

  private waitForTestsStarted(testRun: number, sessionId: string) {
    const timeoutId = setTimeout(() => {
      const session = this.sessions.get(sessionId)!;
      if (session.testRun !== testRun) {
        // session reloaded in the meantime
        return;
      }

      if (session.status === SESSION_STATUS.INITIALIZING) {
        this.setSessionFailed(session, {
          message:
            `Browser tests did not start after ${this.config.testsStartTimeout}ms. ` +
            'Check the browser logs or open the browser in debug mode for more information.',
        });
        return;
      }
    }, this.config.testsStartTimeout!);

    this.addTimeoutId(sessionId, timeoutId);
  }

  private waitForTestsFinished(testRun: number, sessionId: string) {
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
            'Check the browser logs or open the browser in debug mode for more information.',
        });
      }
    }, this.config.testsFinishTimeout!);

    this.addTimeoutId(sessionId, timeoutId);
  }

  /**
   * Returns whether the session has gone stale. Sessions are immutable, this takes in a
   * snapshot of a session and returns whether the session has since changed test run or status.
   * This can be used to decide whether perform side effects like logging or changing status.
   */
  private isStale(session: TestSession): boolean {
    const currentSession = this.sessions.get(session.id);
    return (
      !currentSession ||
      currentSession.testRun !== session.testRun ||
      currentSession.status !== session.status
    );
  }

  private addTimeoutId(sessionId: string, id: any) {
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
}
