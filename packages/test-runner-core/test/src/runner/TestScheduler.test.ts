import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as hanbi from 'hanbi';

import { BrowserLauncher } from '../../../src/browser-launcher/BrowserLauncher.ts';

import { TestRunnerCoreConfig } from '../../../src/config/TestRunnerCoreConfig.ts';
import { TestScheduler } from '../../../src/runner/TestScheduler.ts';
import { TestSession } from '../../../src/test-session/TestSession.ts';
import { TestSessionManager } from '../../../src/test-session/TestSessionManager.ts';
import { SESSION_STATUS } from '../../../src/test-session/TestSessionStatus.ts';

function timeout(ms = 0): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

interface BrowserStubs {
  stop: hanbi.Stub<Exclude<BrowserLauncher['stop'], undefined>>;
  startDebugSession: hanbi.Stub<BrowserLauncher['startDebugSession']>;
  startSession: hanbi.Stub<BrowserLauncher['startSession']>;
  stopSession: hanbi.Stub<BrowserLauncher['stopSession']>;
  isActive: hanbi.Stub<BrowserLauncher['isActive']>;
  getBrowserUrl: hanbi.Stub<BrowserLauncher['getBrowserUrl']>;
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

  function createBrowserStub(name: string): [BrowserStubs, BrowserLauncher] {
    const spies = {
      stop: hanbi.spy(),
      startDebugSession: hanbi.spy(),
      startSession: hanbi.spy(),
      stopSession: hanbi.spy(),
      isActive: hanbi.spy(),
      getBrowserUrl: hanbi.spy(),
    };
    spies.stop.returns(timeout(1));
    spies.startDebugSession.returns(timeout(1));
    spies.startSession.returns(timeout(1));
    spies.stopSession.returns(timeout(1).then(() => ({ testCoverage: {} })));
    spies.isActive.returns(true);
    spies.getBrowserUrl.returns('');
    return [
      spies,
      {
        name,
        type: name,
        stop: spies.stop.handler,
        startDebugSession: spies.startDebugSession.handler,
        startSession: spies.startSession.handler,
        stopSession: spies.stopSession.handler,
        isActive: spies.isActive.handler,
        getBrowserUrl: spies.getBrowserUrl.handler,
      },
    ];
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
  ): [TestScheduler, TestSessionManager, TestSession[], BrowserStubs] {
    const [browserStubs, browser] = createBrowserStub('a');
    const sessions: TestSession[] = [];
    for (const id of ids) {
      const session = createSession({ id, browser });
      sessions.push(session);
    }
    const sessionManager = new TestSessionManager([], sessions);
    const scheduler = new TestScheduler(mockConfig, sessionManager, [browser]);
    return [scheduler, sessionManager, sessions, browserStubs];
  }

  describe('single browser', () => {
    it('scheduling a session starts the browser and marks initializing', async () => {
      const [scheduler, sessions, [session1], stubs] = createTestFixture('1');
      scheduler.schedule(1, [session1]);

      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.status, SESSION_STATUS.INITIALIZING);
      assert.equal(stubs.startSession.callCount, 1);
    });

    it('when a session goes to status test finished, the browser is stopped and results is stored', async () => {
      const [scheduler, sessions, [session1], stubs] = createTestFixture('1');
      const testCoverage = {};
      stubs.stopSession.returns(timeout(1).then(() => ({ testCoverage })));
      scheduler.schedule(1, [session1]);

      await timeout(2);
      sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_FINISHED);
      await timeout(4);

      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.status, SESSION_STATUS.FINISHED);
      assert.equal(finalSession1.passed, true);
      assert.equal(finalSession1.testCoverage, testCoverage);
    });

    it('batches test execution', async () => {
      const [scheduler, sessions, sessionsToSchedule] = createTestFixture('1', '2', '3');
      scheduler.schedule(1, sessionsToSchedule);

      assert.equal(sessions.get('1')!.status, SESSION_STATUS.INITIALIZING);
      assert.equal(sessions.get('2')!.status, SESSION_STATUS.INITIALIZING);
      assert.equal(sessions.get('3')!.status, SESSION_STATUS.SCHEDULED);

      // wait for browser to start, session 3 should still not be started
      await timeout(2);
      assert.equal(sessions.get('3')!.status, SESSION_STATUS.SCHEDULED);

      // mark tests as finished
      sessions.updateStatus({ ...sessions.get('1')!, passed: true }, SESSION_STATUS.TEST_FINISHED);
      sessions.updateStatus({ ...sessions.get('2')!, passed: true }, SESSION_STATUS.TEST_FINISHED);

      // wait for browser to end
      await timeout(4);

      // sessions 1 and 2 should be finished
      assert.equal(sessions.get('1')!.status, SESSION_STATUS.FINISHED);
      assert.equal(sessions.get('1')!.passed, true);
      assert.equal(sessions.get('2')!.status, SESSION_STATUS.FINISHED);
      assert.equal(sessions.get('2')!.passed, true);

      // session 3 should be started
      assert.equal(sessions.get('3')!.status, SESSION_STATUS.INITIALIZING);
    });

    it('scheduling new tests while executing keeps batching', async () => {
      const sessionIds = ['1', '2', '3', '4', '5', '6'];
      const [scheduler, sessions, sessionsToSchedule] = createTestFixture(...sessionIds);

      // schedule 2 sessions
      scheduler.schedule(1, sessionsToSchedule.slice(0, 2));

      assert.equal(sessions.get('1')!.status, SESSION_STATUS.INITIALIZING);
      assert.equal(sessions.get('2')!.status, SESSION_STATUS.INITIALIZING);

      // schedule 3 more sessions after browser starts
      await timeout(4);
      scheduler.schedule(1, sessionsToSchedule.slice(2, 5));
      assert.equal(sessions.get('1')!.status, SESSION_STATUS.INITIALIZING);
      assert.equal(sessions.get('2')!.status, SESSION_STATUS.INITIALIZING);
      assert.equal(sessions.get('3')!.status, SESSION_STATUS.SCHEDULED);
      assert.equal(sessions.get('4')!.status, SESSION_STATUS.SCHEDULED);
      assert.equal(sessions.get('5')!.status, SESSION_STATUS.SCHEDULED);

      // mark first test as finished
      sessions.updateStatus({ ...sessions.get('1')!, passed: true }, SESSION_STATUS.TEST_FINISHED);

      // wait for browser to end
      await timeout(4);

      // session 1 is finished, session 2 is still waiting, session 3 is now starting and the rest is still scheduled
      assert.equal(sessions.get('1')!.status, SESSION_STATUS.FINISHED);
      assert.equal(sessions.get('1')!.passed, true);
      assert.equal(sessions.get('2')!.status, SESSION_STATUS.INITIALIZING);
      assert.equal(sessions.get('3')!.status, SESSION_STATUS.INITIALIZING);
      assert.equal(sessions.get('4')!.status, SESSION_STATUS.SCHEDULED);
      assert.equal(sessions.get('5')!.status, SESSION_STATUS.SCHEDULED);

      // mark 2 and 3 as finished
      await timeout(2);
      sessions.updateStatus({ ...sessions.get('2')!, passed: true }, SESSION_STATUS.TEST_FINISHED);
      sessions.updateStatus({ ...sessions.get('3')!, passed: true }, SESSION_STATUS.TEST_FINISHED);

      // 2 and 3 finish when browser closes
      await timeout(2);
      assert.equal(sessions.get('2')!.status, SESSION_STATUS.FINISHED);
      assert.equal(sessions.get('3')!.status, SESSION_STATUS.FINISHED);
    });

    it('error while starting browser marks session as failed', async () => {
      const [scheduler, sessions, [session1], stubs] = createTestFixture('1');
      stubs.startSession.callsFake(() => Promise.reject(new Error('mock error')));
      scheduler.schedule(1, [session1]);

      await timeout(4);

      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.status, SESSION_STATUS.FINISHED);
      assert.equal(finalSession1.passed, false);
      assert.equal(finalSession1.errors.length, 1);
      assert.equal(finalSession1.errors[0].message, 'mock error');
    });

    it('error while starting browser after a session changed state gets logged', async () => {
      const errorStub = hanbi.stubMethod(mockConfig.logger, 'error');
      const [scheduler, sessions, [session1], stubs] = createTestFixture('1');
      stubs.startSession.returns(
        timeout(5).then(() => {
          throw new Error('mock error');
        }),
      );
      scheduler.schedule(1, [session1]);

      await timeout(1);
      sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_FINISHED);
      await timeout(2);

      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.status, SESSION_STATUS.FINISHED);
      assert.equal(finalSession1.passed, true);

      await timeout(20);

      assert.equal(errorStub.callCount, 1);
      assert(errorStub.getCall(0).args[0] instanceof Error);
      assert.equal((errorStub.getCall(0).args[0] as Error).message, 'mock error');
    });

    it('error while stopping browser marks session as failed', async () => {
      const [scheduler, sessions, [session1], stubs] = createTestFixture('1');
      stubs.stopSession.callsFake(() => Promise.reject(new Error('mock error')));
      scheduler.schedule(1, [session1]);

      await timeout(2);
      sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_FINISHED);
      await timeout(4);

      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.status, SESSION_STATUS.FINISHED);
      assert.equal(finalSession1.passed, false);
      assert.equal(finalSession1.errors.length, 1);
      assert.equal(finalSession1.errors[0].message, 'mock error');
    });

    it('timeout starting the browser marks the session as failed', async () => {
      mockConfig.browserStartTimeout = 2;
      const [scheduler, sessions, [session1], stubs] = createTestFixture('1');
      stubs.startSession.returns(timeout(4));
      scheduler.schedule(1, [session1]);

      await timeout(3);

      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.status, SESSION_STATUS.FINISHED);
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

      await timeout(20);

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

      await timeout(1);
      sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_STARTED);
      await timeout(4);

      const finalSession1 = sessions.get(session1.id)!;
      assert.equal(finalSession1.status, SESSION_STATUS.FINISHED);
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
    ): [TestScheduler, TestSessionManager, Array<[BrowserStubs, BrowserLauncher]>, TestSession[]] {
      const browsers: Array<[BrowserStubs, BrowserLauncher]> = [];
      const sessions: TestSession[] = [];

      for (const fixture of fixtures) {
        const [stubs, browser] = createBrowserStub(fixture.name);
        browsers.push([stubs, browser]);

        for (const id of fixture.ids) {
          const session = createSession({ id, browser });
          sessions.push(session);
        }
      }

      const sessionManager = new TestSessionManager([], sessions);
      const scheduler = new TestScheduler(
        mockConfig,
        sessionManager,
        browsers.map(b => b[1]),
      );
      return [scheduler, sessionManager, browsers, sessions];
    }

    it('can schedule sessions on multiple browsers', async () => {
      const [scheduler, sessionManager, browsers, sessions] = createTestFixture([
        { name: 'a', ids: ['1', '2', '3'] },
        { name: 'b', ids: ['4', '5', '6'] },
        { name: 'c', ids: ['7', '8', '9'] },
      ]);
      scheduler.schedule(1, sessions);

      const session1 = sessionManager.get('1')!;
      const session2 = sessionManager.get('2')!;
      const session3 = sessionManager.get('3')!;
      assert.equal(session1.browser, browsers[0][1]);
      assert.equal(session2.browser, browsers[0][1]);
      assert.equal(session3.browser, browsers[0][1]);
      assert.equal(session1.status, SESSION_STATUS.INITIALIZING);
      assert.equal(session2.status, SESSION_STATUS.INITIALIZING);
      assert.equal(session3.status, SESSION_STATUS.SCHEDULED);
      assert.equal(browsers[0][0].startSession.callCount, 2);

      const session4 = sessionManager.get('4')!;
      const session5 = sessionManager.get('5')!;
      const session6 = sessionManager.get('6')!;
      assert.equal(session4.browser, browsers[1][1]);
      assert.equal(session5.browser, browsers[1][1]);
      assert.equal(session6.browser, browsers[1][1]);
      assert.equal(session4.status, SESSION_STATUS.INITIALIZING);
      assert.equal(session5.status, SESSION_STATUS.INITIALIZING);
      assert.equal(session6.status, SESSION_STATUS.SCHEDULED);
      assert.equal(browsers[1][0].startSession.callCount, 2);

      const session7 = sessionManager.get('7')!;
      const session8 = sessionManager.get('8')!;
      const session9 = sessionManager.get('9')!;
      assert.equal(session7.browser, browsers[2][1]);
      assert.equal(session8.browser, browsers[2][1]);
      assert.equal(session9.browser, browsers[2][1]);
      assert.equal(session7.status, SESSION_STATUS.SCHEDULED);
      assert.equal(session8.status, SESSION_STATUS.SCHEDULED);
      assert.equal(session9.status, SESSION_STATUS.SCHEDULED);
      assert.equal(browsers[2][0].startSession.called, false);
    });

    it('finishing a test schedules a new one', async () => {
      const [scheduler, sessionManager, browsers, sessions] = createTestFixture([
        { name: 'a', ids: ['1', '2', '3'] },
        { name: 'b', ids: ['4', '5', '6'] },
        { name: 'c', ids: ['7', '8', '9'] },
      ]);
      scheduler.schedule(1, sessions);

      await timeout(1);
      sessionManager.updateStatus({ ...sessions[0], passed: true }, SESSION_STATUS.TEST_FINISHED);
      await timeout(4);

      const session3 = sessionManager.get('3')!;
      assert.equal(session3.browser, browsers[0][1]);
      assert.equal(session3.status, SESSION_STATUS.INITIALIZING);
      assert.equal(browsers[0][0].startSession.callCount, 3);
    });

    it('overflow of concurrency budget does not trigger a new browser to start', async () => {
      const [scheduler, sessionManager, browsers, sessions] = createTestFixture([
        { name: 'a', ids: ['1', '2', '3'] },
        { name: 'b', ids: ['4', '5', '6'] },
        { name: 'c', ids: ['7', '8', '9'] },
      ]);
      scheduler.schedule(1, sessions);

      await timeout(2);
      sessionManager.updateStatus({ ...sessions[0], passed: true }, SESSION_STATUS.TEST_FINISHED);
      sessionManager.updateStatus({ ...sessions[1], passed: true }, SESSION_STATUS.TEST_FINISHED);
      await timeout(4);

      const session7 = sessionManager.get('7')!;
      assert.equal(session7.browser, browsers[2][1]);
      assert.equal(session7.status, SESSION_STATUS.SCHEDULED);
      assert.equal(browsers[2][0].startSession.called, false);
    });

    it('finishing one browsers schedules a new browser', async () => {
      const [scheduler, sessionManager, browsers, sessions] = createTestFixture([
        { name: 'a', ids: ['1', '2', '3'] },
        { name: 'b', ids: ['4', '5', '6'] },
        { name: 'c', ids: ['7', '8', '9'] },
      ]);
      scheduler.schedule(1, sessions);

      await timeout(2);
      sessionManager.updateStatus({ ...sessions[0], passed: true }, SESSION_STATUS.TEST_FINISHED);
      sessionManager.updateStatus({ ...sessions[1], passed: true }, SESSION_STATUS.TEST_FINISHED);
      await timeout(2);
      sessionManager.updateStatus({ ...sessions[2], passed: true }, SESSION_STATUS.TEST_FINISHED);
      await timeout(4);

      const session7 = sessionManager.get('7')!;
      assert.equal(session7.browser, browsers[2][1]);
      assert.equal(session7.status, SESSION_STATUS.INITIALIZING);
      assert.equal(browsers[2][0].startSession.callCount, 2);
    });
  });
});
