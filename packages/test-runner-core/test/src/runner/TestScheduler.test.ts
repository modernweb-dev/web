import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

import type { BrowserLauncher } from '../../../dist/browser-launcher/BrowserLauncher.js';

import { timeout } from '../../../../../test-helpers/node.js';
import type { TestRunnerCoreConfig } from '../../../dist/config/TestRunnerCoreConfig.js';
import { TestScheduler } from '../../../dist/runner/TestScheduler.js';
import type { TestSession } from '../../../dist/test-session/TestSession.js';
import { TestSessionManager } from '../../../dist/test-session/TestSessionManager.js';
import { SESSION_STATUS } from '../../../dist/test-session/TestSessionStatus.js';

async function waitUntilEqual<T>(
  getActual: () => T,
  expected: T,
  timeoutMs = 100,
  intervalMs = 5,
): Promise<void> {
  const start = Date.now();
  while (getActual() !== expected) {
    if (Date.now() - start > timeoutMs) {
      assert.equal(getActual(), expected);
      return;
    }
    await timeout(intervalMs);
  }
}

describe('TestScheduler', () => {
  let mockConfig: TestRunnerCoreConfig;

  function createSession(session: Partial<TestSession>): TestSession {
    return {
      ...session,
      testFile: `test-${session.id}.js`,
      status: SESSION_STATUS.SCHEDULED,
    } as Partial<TestSession> as TestSession;
  }

  function createBrowserStub(name: string): BrowserLauncher {
    return {
      name,
      type: name,
      stop: mock.fn(() => timeout(1)),
      startDebugSession: mock.fn(() => timeout(1)),
      startSession: mock.fn(() => timeout(1)),
      stopSession: mock.fn(() => timeout(1).then(() => ({ testCoverage: {} }))),
      isActive: mock.fn(() => true),
      getBrowserUrl: mock.fn(() => ''),
    };
  }

  beforeEach(() => {
    mockConfig = {
      rootDir: process.cwd(),
      logger: {
        ...console,
        error(...args) {
          console.error(...args);
        },
        logSyntaxError(error) {
          console.error(error);
        },
      },
      protocol: 'http:',
      hostname: 'localhost',
      port: 8000,
      concurrentBrowsers: 2,
      concurrency: 2,
      browserStartTimeout: 1000,
      testsStartTimeout: 1000,
      testsFinishTimeout: 1000,
    } as Partial<TestRunnerCoreConfig> as TestRunnerCoreConfig;
  });

  function createTestFixture(
    ...ids: string[]
  ): [TestScheduler, TestSessionManager, TestSession[], BrowserLauncher] {
    const browser = createBrowserStub('a');
    const sessions: TestSession[] = [];
    for (const id of ids) {
      const session = createSession({ id, browser });
      sessions.push(session);
    }
    const sessionManager = new TestSessionManager([], sessions);
    const scheduler = new TestScheduler(mockConfig, sessionManager, [browser]);
    return [scheduler, sessionManager, sessions, browser];
  }

  describe('single browser', () => {
    it('scheduling a session starts the browser and marks initializing', async () => {
      const [scheduler, sessions, [session1], browser] = createTestFixture('1');
      scheduler.schedule(1, [session1]);

      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.INITIALIZING);
      assert.equal(browser.startSession.mock.callCount(), 1);
    });

    it('when a session goes to status test finished, the browser is stopped and results is stored', async () => {
      const [scheduler, sessions, [session1], browser] = createTestFixture('1');
      const testCoverage = {};
      browser.stopSession.mock.mockImplementation(() => timeout(1).then(() => ({ testCoverage })));
      scheduler.schedule(1, [session1]);

      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.INITIALIZING);

      sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_FINISHED);
      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.FINISHED);
      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.passed, true);
      assert.equal(finalSession1.testCoverage, testCoverage);
    });

    it('batches test execution', async () => {
      const [scheduler, sessions, sessionsToSchedule] = createTestFixture('1', '2', '3');
      scheduler.schedule(1, sessionsToSchedule);

      // wait for browser to start, session 3 should still not be started
      await waitUntilEqual(() => sessions.get('1')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessions.get('2')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessions.get('3')!.status, SESSION_STATUS.SCHEDULED);

      // mark tests as finished
      sessions.updateStatus({ ...sessions.get('1')!, passed: true }, SESSION_STATUS.TEST_FINISHED);
      sessions.updateStatus({ ...sessions.get('2')!, passed: true }, SESSION_STATUS.TEST_FINISHED);

      // wait for sessions to finish
      await waitUntilEqual(() => sessions.get('1')!.status, SESSION_STATUS.FINISHED);
      await waitUntilEqual(() => sessions.get('2')!.status, SESSION_STATUS.FINISHED);

      // sessions 1 and 2 should pass
      assert.equal(sessions.get('1')!.passed, true);
      assert.equal(sessions.get('2')!.passed, true);

      // session 3 should be started
      await waitUntilEqual(() => sessions.get('3')!.status, SESSION_STATUS.INITIALIZING);
    });

    it('scheduling new tests while executing keeps batching', async () => {
      const sessionIds = ['1', '2', '3', '4', '5', '6'];
      const [scheduler, sessions, sessionsToSchedule] = createTestFixture(...sessionIds);

      // schedule 2 sessions
      scheduler.schedule(1, sessionsToSchedule.slice(0, 2));
      await waitUntilEqual(() => sessions.get('1')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessions.get('2')!.status, SESSION_STATUS.INITIALIZING);

      // schedule 3 more sessions after browser starts
      scheduler.schedule(1, sessionsToSchedule.slice(2, 5));
      await waitUntilEqual(() => sessions.get('1')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessions.get('2')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessions.get('3')!.status, SESSION_STATUS.SCHEDULED);
      await waitUntilEqual(() => sessions.get('4')!.status, SESSION_STATUS.SCHEDULED);
      await waitUntilEqual(() => sessions.get('5')!.status, SESSION_STATUS.SCHEDULED);

      // mark first test as finished
      sessions.updateStatus({ ...sessions.get('1')!, passed: true }, SESSION_STATUS.TEST_FINISHED);

      // session 1 passed, session 2 is still waiting, session 3 is now starting and the rest is still scheduled
      await waitUntilEqual(() => sessions.get('1')!.status, SESSION_STATUS.FINISHED);
      assert.equal(sessions.get('1')!.passed, true);
      await waitUntilEqual(() => sessions.get('2')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessions.get('3')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessions.get('4')!.status, SESSION_STATUS.SCHEDULED);
      await waitUntilEqual(() => sessions.get('5')!.status, SESSION_STATUS.SCHEDULED);

      // mark 2 and 3 as finished
      sessions.updateStatus({ ...sessions.get('2')!, passed: true }, SESSION_STATUS.TEST_FINISHED);
      sessions.updateStatus({ ...sessions.get('3')!, passed: true }, SESSION_STATUS.TEST_FINISHED);

      // 2 and 3 finish when browser closes
      await waitUntilEqual(() => sessions.get('2')!.status, SESSION_STATUS.FINISHED);
      await waitUntilEqual(() => sessions.get('3')!.status, SESSION_STATUS.FINISHED);
    });

    it('error while starting browser marks session as failed', async () => {
      const [scheduler, sessions, [session1], browser] = createTestFixture('1');
      browser.startSession.mock.mockImplementation(() => Promise.reject(new Error('mock error')));
      scheduler.schedule(1, [session1]);

      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.FINISHED);
      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.passed, false);
      assert.equal(finalSession1.errors.length, 1);
      assert.equal(finalSession1.errors[0].message, 'mock error');
    });

    it('error while starting browser after a session changed state gets logged', async () => {
      const errorStub = mock.method(mockConfig.logger, 'error');
      const [scheduler, sessions, [session1], browser] = createTestFixture('1');
      browser.startSession.mock.mockImplementation(() =>
        timeout(1).then(() => {
          throw new Error('mock error');
        }),
      );
      scheduler.schedule(1, [session1]);

      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.INITIALIZING);

      sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_FINISHED);
      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.FINISHED);
      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.passed, true);

      await waitUntilEqual(() => errorStub.mock.callCount(), 1);
      assert.equal(errorStub.mock.callCount(), 1);
      assert.ok(errorStub.mock.calls[0].arguments[0] instanceof Error);
      assert.equal((errorStub.mock.calls[0].arguments[0] as Error).message, 'mock error');
    });

    it('error while stopping browser marks session as failed', async () => {
      const [scheduler, sessions, [session1], browser] = createTestFixture('1');
      browser.stopSession.mock.mockImplementation(() => Promise.reject(new Error('mock error')));
      scheduler.schedule(1, [session1]);

      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.INITIALIZING);

      sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_FINISHED);
      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.FINISHED);
      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.passed, false);
      assert.equal(finalSession1.errors.length, 1);
      assert.equal(finalSession1.errors[0].message, 'mock error');
    });

    it('timeout starting the browser marks the session as failed', async () => {
      mockConfig.browserStartTimeout = 2;
      const [scheduler, sessions, [session1], browser] = createTestFixture('1');
      browser.startSession.mock.mockImplementation(() => timeout(50));
      scheduler.schedule(1, [session1]);

      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.FINISHED);
      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.passed, false);
      assert.equal(finalSession1.errors.length, 1);
      assert.equal(
        finalSession1.errors[0].message,
        'The browser was unable to create and start a test page after 2ms. You can increase this timeout with the browserStartTimeout option.',
      );
    });

    it('timeout starting the tests marks the session as failed', async () => {
      mockConfig.testsStartTimeout = 2;
      const [scheduler, sessions, [session1]] = createTestFixture('1');
      scheduler.schedule(1, [session1]);

      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.FINISHED);
      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.status, SESSION_STATUS.FINISHED);
      assert.equal(finalSession1.passed, false);
      assert.equal(finalSession1.errors.length, 1);
      assert.equal(
        finalSession1.errors[0].message,
        'Browser tests did not start after 2ms You can increase this timeout with the testsStartTimeout option. Check the browser logs or open the browser in debug mode for more information.',
      );
    });

    it('timeout finishing the tests marks the session as failed', async () => {
      mockConfig.testsFinishTimeout = 2;
      const [scheduler, sessions, [session1]] = createTestFixture('1');
      scheduler.schedule(1, [session1]);

      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.INITIALIZING);

      sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_STARTED);
      await waitUntilEqual(() => sessions.get(session1.id)!.status, SESSION_STATUS.FINISHED);
      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.passed, false);
      assert.equal(finalSession1.errors.length, 1);
      assert.equal(
        finalSession1.errors[0].message,
        'Browser tests did not finish within 2ms. You can increase this timeout with the testsFinishTimeout option. Check the browser logs or open the browser in debug mode for more information.',
      );
    });
  });

  describe('multi browsers', () => {
    function createTestFixture(
      fixtures: { name: string; ids: string[] }[],
    ): [TestScheduler, TestSessionManager, Array<BrowserLauncher>, TestSession[]] {
      const browsers: Array<BrowserLauncher> = [];
      const sessions: TestSession[] = [];

      for (const fixture of fixtures) {
        const browser = createBrowserStub(fixture.name);
        browsers.push(browser);

        for (const id of fixture.ids) {
          const session = createSession({ id, browser });
          sessions.push(session);
        }
      }

      const sessionManager = new TestSessionManager([], sessions);
      const scheduler = new TestScheduler(mockConfig, sessionManager, browsers);
      return [scheduler, sessionManager, browsers, sessions];
    }

    it('can schedule sessions on multiple browsers', async () => {
      const [scheduler, sessionManager, browsers, sessions] = createTestFixture([
        { name: 'a', ids: ['1', '2', '3'] },
        { name: 'b', ids: ['4', '5', '6'] },
        { name: 'c', ids: ['7', '8', '9'] },
      ]);
      scheduler.schedule(1, sessions);

      await waitUntilEqual(() => sessionManager.get('1')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessionManager.get('2')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessionManager.get('3')!.status, SESSION_STATUS.SCHEDULED);
      const session1 = sessionManager.get('1')!;
      const session2 = sessionManager.get('2')!;
      const session3 = sessionManager.get('3')!;
      assert.equal(session1.browser, browsers[0]);
      assert.equal(session2.browser, browsers[0]);
      assert.equal(session3.browser, browsers[0]);
      assert.equal(browsers[0].startSession.mock.callCount(), 2);

      await waitUntilEqual(() => sessionManager.get('4')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessionManager.get('5')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessionManager.get('6')!.status, SESSION_STATUS.SCHEDULED);
      const session4 = sessionManager.get('4')!;
      const session5 = sessionManager.get('5')!;
      const session6 = sessionManager.get('6')!;
      assert.equal(session4.browser, browsers[1]);
      assert.equal(session5.browser, browsers[1]);
      assert.equal(session6.browser, browsers[1]);
      assert.equal(browsers[1].startSession.mock.callCount(), 2);

      await waitUntilEqual(() => sessionManager.get('7')!.status, SESSION_STATUS.SCHEDULED);
      await waitUntilEqual(() => sessionManager.get('8')!.status, SESSION_STATUS.SCHEDULED);
      await waitUntilEqual(() => sessionManager.get('9')!.status, SESSION_STATUS.SCHEDULED);
      const session7 = sessionManager.get('7')!;
      const session8 = sessionManager.get('8')!;
      const session9 = sessionManager.get('9')!;
      assert.equal(session7.browser, browsers[2]);
      assert.equal(session8.browser, browsers[2]);
      assert.equal(session9.browser, browsers[2]);
      assert.equal(browsers[2].startSession.mock.callCount(), 0);
    });

    it('finishing a test schedules a new one', async () => {
      const [scheduler, sessionManager, browsers, sessions] = createTestFixture([
        { name: 'a', ids: ['1', '2', '3'] },
        { name: 'b', ids: ['4', '5', '6'] },
        { name: 'c', ids: ['7', '8', '9'] },
      ]);
      scheduler.schedule(1, sessions);

      await waitUntilEqual(() => sessionManager.get('1')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessionManager.get('2')!.status, SESSION_STATUS.INITIALIZING);

      sessionManager.updateStatus({ ...sessions[0], passed: true }, SESSION_STATUS.TEST_FINISHED);
      await waitUntilEqual(() => sessionManager.get('3')!.status, SESSION_STATUS.INITIALIZING);
      const session3 = sessionManager.get('3')!;
      assert.equal(session3.browser, browsers[0]);
      assert.equal(browsers[0].startSession.mock.callCount(), 3);
    });

    it('overflow of concurrency budget does not trigger a new browser to start', async () => {
      const [scheduler, sessionManager, browsers, sessions] = createTestFixture([
        { name: 'a', ids: ['1', '2', '3'] },
        { name: 'b', ids: ['4', '5', '6'] },
        { name: 'c', ids: ['7', '8', '9'] },
      ]);
      scheduler.schedule(1, sessions);

      await waitUntilEqual(() => sessionManager.get('1')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessionManager.get('2')!.status, SESSION_STATUS.INITIALIZING);

      sessionManager.updateStatus({ ...sessions[0], passed: true }, SESSION_STATUS.TEST_FINISHED);
      sessionManager.updateStatus({ ...sessions[1], passed: true }, SESSION_STATUS.TEST_FINISHED);
      await waitUntilEqual(() => sessionManager.get('7')!.status, SESSION_STATUS.SCHEDULED);
      const session7 = sessionManager.get('7')!;
      assert.equal(session7.browser, browsers[2]);
      assert.equal(browsers[2].startSession.mock.callCount(), 0);
    });

    it('finishing one browsers schedules a new browser', async () => {
      const [scheduler, sessionManager, browsers, sessions] = createTestFixture([
        { name: 'a', ids: ['1', '2', '3'] },
        { name: 'b', ids: ['4', '5', '6'] },
        { name: 'c', ids: ['7', '8', '9'] },
      ]);
      scheduler.schedule(1, sessions);

      await waitUntilEqual(() => sessionManager.get('1')!.status, SESSION_STATUS.INITIALIZING);
      await waitUntilEqual(() => sessionManager.get('2')!.status, SESSION_STATUS.INITIALIZING);

      sessionManager.updateStatus({ ...sessions[0], passed: true }, SESSION_STATUS.TEST_FINISHED);
      sessionManager.updateStatus({ ...sessions[1], passed: true }, SESSION_STATUS.TEST_FINISHED);
      await waitUntilEqual(() => sessionManager.get('1')!.status, SESSION_STATUS.FINISHED);
      await waitUntilEqual(() => sessionManager.get('2')!.status, SESSION_STATUS.FINISHED);
      await waitUntilEqual(() => sessionManager.get('7')!.status, SESSION_STATUS.SCHEDULED);

      sessionManager.updateStatus({ ...sessions[2], passed: true }, SESSION_STATUS.TEST_FINISHED);
      await waitUntilEqual(() => sessionManager.get('7')!.status, SESSION_STATUS.INITIALIZING);
      const session7 = sessionManager.get('7')!;
      assert.equal(session7.browser, browsers[2]);
      assert.equal(browsers[2].startSession.mock.callCount(), 2);
    });
  });
});
