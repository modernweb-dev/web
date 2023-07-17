import { expect } from 'chai';
import * as hanbi from 'hanbi';

import { BrowserLauncher } from '../../../src/browser-launcher/BrowserLauncher.js';

import { TestRunnerCoreConfig } from '../../../src/config/TestRunnerCoreConfig.js';
import { TestScheduler } from '../../../src/runner/TestScheduler.js';
import { TestSession } from '../../../src/test-session/TestSession.js';
import { TestSessionManager } from '../../../src/test-session/TestSessionManager.js';
import { SESSION_STATUS } from '../../../src/test-session/TestSessionStatus.js';

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
      expect(finalSession1.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(stubs.startSession.callCount).to.equal(1);
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
      expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
      expect(finalSession1.passed).to.equal(true);
      expect(finalSession1.testCoverage).to.equal(testCoverage);
    });

    it('batches test execution', async () => {
      const [scheduler, sessions, sessionsToSchedule] = createTestFixture('1', '2', '3');
      scheduler.schedule(1, sessionsToSchedule);

      expect(sessions.get('1')!.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(sessions.get('2')!.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(sessions.get('3')!.status).to.equal(SESSION_STATUS.SCHEDULED);

      // wait for browser to start, session 3 should still not be started
      await timeout(2);
      expect(sessions.get('3')!.status).to.equal(SESSION_STATUS.SCHEDULED);

      // mark tests as finished
      sessions.updateStatus({ ...sessions.get('1')!, passed: true }, SESSION_STATUS.TEST_FINISHED);
      sessions.updateStatus({ ...sessions.get('2')!, passed: true }, SESSION_STATUS.TEST_FINISHED);

      // wait for browser to end
      await timeout(4);

      // sessions 1 and 2 should be finished
      expect(sessions.get('1')!.status).to.equal(SESSION_STATUS.FINISHED);
      expect(sessions.get('1')!.passed).to.be.true;
      expect(sessions.get('2')!.status).to.equal(SESSION_STATUS.FINISHED);
      expect(sessions.get('2')!.passed).to.be.true;

      // session 3 should be started
      expect(sessions.get('3')!.status).to.equal(SESSION_STATUS.INITIALIZING);
    });

    it('scheduling new tests while executing keeps batching', async () => {
      const sessionIds = ['1', '2', '3', '4', '5', '6'];
      const [scheduler, sessions, sessionsToSchedule] = createTestFixture(...sessionIds);

      // schedule 2 sessions
      scheduler.schedule(1, sessionsToSchedule.slice(0, 2));

      expect(sessions.get('1')!.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(sessions.get('2')!.status).to.equal(SESSION_STATUS.INITIALIZING);

      // schedule 3 more sessions after browser starts
      await timeout(4);
      scheduler.schedule(1, sessionsToSchedule.slice(2, 5));
      expect(sessions.get('1')!.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(sessions.get('2')!.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(sessions.get('3')!.status).to.equal(SESSION_STATUS.SCHEDULED);
      expect(sessions.get('4')!.status).to.equal(SESSION_STATUS.SCHEDULED);
      expect(sessions.get('5')!.status).to.equal(SESSION_STATUS.SCHEDULED);

      // mark first test as finished
      sessions.updateStatus({ ...sessions.get('1')!, passed: true }, SESSION_STATUS.TEST_FINISHED);

      // wait for browser to end
      await timeout(4);

      // session 1 is finished, session 2 is still waiting, session 3 is now starting and the rest is still scheduled
      expect(sessions.get('1')!.status).to.equal(SESSION_STATUS.FINISHED);
      expect(sessions.get('1')!.passed).to.be.true;
      expect(sessions.get('2')!.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(sessions.get('3')!.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(sessions.get('4')!.status).to.equal(SESSION_STATUS.SCHEDULED);
      expect(sessions.get('5')!.status).to.equal(SESSION_STATUS.SCHEDULED);

      // mark 2 and 3 as finished
      await timeout(2);
      sessions.updateStatus({ ...sessions.get('2')!, passed: true }, SESSION_STATUS.TEST_FINISHED);
      sessions.updateStatus({ ...sessions.get('3')!, passed: true }, SESSION_STATUS.TEST_FINISHED);

      // 2 and 3 finish when browser closes
      await timeout(2);
      expect(sessions.get('2')!.status).to.equal(SESSION_STATUS.FINISHED);
      expect(sessions.get('3')!.status).to.equal(SESSION_STATUS.FINISHED);
    });

    it('error while starting browser marks session as failed', async () => {
      const [scheduler, sessions, [session1], stubs] = createTestFixture('1');
      stubs.startSession.callsFake(() => Promise.reject(new Error('mock error')));
      scheduler.schedule(1, [session1]);

      await timeout(4);

      const finalSession1 = sessions.get(session1.id)!;
      expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
      expect(finalSession1.passed).to.equal(false);
      expect(finalSession1.errors.length).to.equal(1);
      expect(finalSession1.errors[0].message).to.equal('mock error');
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
      expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
      expect(finalSession1.passed).to.equal(true);

      await timeout(20);

      expect(errorStub.callCount).to.equal(1);
      expect(errorStub.getCall(0).args[0]).to.an.instanceof(Error);
      expect((errorStub.getCall(0).args[0] as Error).message).to.equal('mock error');
    });

    it('error while stopping browser marks session as failed', async () => {
      const [scheduler, sessions, [session1], stubs] = createTestFixture('1');
      stubs.stopSession.callsFake(() => Promise.reject(new Error('mock error')));
      scheduler.schedule(1, [session1]);

      await timeout(2);
      sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_FINISHED);
      await timeout(4);

      const finalSession1 = sessions.get(session1.id)!;
      expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
      expect(finalSession1.passed).to.equal(false);
      expect(finalSession1.errors.length).to.equal(1);
      expect(finalSession1.errors[0].message).to.equal('mock error');
    });

    it('timeout starting the browser marks the session as failed', async () => {
      mockConfig.browserStartTimeout = 2;
      const [scheduler, sessions, [session1], stubs] = createTestFixture('1');
      stubs.startSession.returns(timeout(4));
      scheduler.schedule(1, [session1]);

      await timeout(3);

      const finalSession1 = sessions.get(session1.id)!;
      expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
      expect(finalSession1.passed).to.equal(false);
      expect(finalSession1.errors.length).to.equal(1);
      expect(finalSession1.errors[0].message).to.equal(
        'The browser was unable to create and start a test page after 2ms. You can increase this timeout with the browserStartTimeout option.',
      );
    });

    it('timeout starting the tests marks the session as failed', async () => {
      mockConfig.testsStartTimeout = 2;
      const [scheduler, sessions, [session1]] = createTestFixture('1');
      scheduler.schedule(1, [session1]);

      await timeout(20);

      const finalSession1 = sessions.get(session1.id)!;
      expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
      expect(finalSession1.passed).to.equal(false);
      expect(finalSession1.errors.length).to.equal(1);
      expect(finalSession1.errors[0].message).to.equal(
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
      expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
      expect(finalSession1.passed).to.equal(false);
      expect(finalSession1.errors.length).to.equal(1);
      expect(finalSession1.errors[0].message).to.equal(
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
      expect(session1.browser).to.equal(browsers[0][1]);
      expect(session2.browser).to.equal(browsers[0][1]);
      expect(session3.browser).to.equal(browsers[0][1]);
      expect(session1.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(session2.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(session3.status).to.equal(SESSION_STATUS.SCHEDULED);
      expect(browsers[0][0].startSession.callCount).to.equal(2);

      const session4 = sessionManager.get('4')!;
      const session5 = sessionManager.get('5')!;
      const session6 = sessionManager.get('6')!;
      expect(session4.browser).to.equal(browsers[1][1]);
      expect(session5.browser).to.equal(browsers[1][1]);
      expect(session6.browser).to.equal(browsers[1][1]);
      expect(session4.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(session5.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(session6.status).to.equal(SESSION_STATUS.SCHEDULED);
      expect(browsers[1][0].startSession.callCount).to.equal(2);

      const session7 = sessionManager.get('7')!;
      const session8 = sessionManager.get('8')!;
      const session9 = sessionManager.get('9')!;
      expect(session7.browser).to.equal(browsers[2][1]);
      expect(session8.browser).to.equal(browsers[2][1]);
      expect(session9.browser).to.equal(browsers[2][1]);
      expect(session7.status).to.equal(SESSION_STATUS.SCHEDULED);
      expect(session8.status).to.equal(SESSION_STATUS.SCHEDULED);
      expect(session9.status).to.equal(SESSION_STATUS.SCHEDULED);
      expect(browsers[2][0].startSession.called).to.equal(false);
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
      expect(session3.browser).to.equal(browsers[0][1]);
      expect(session3.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(browsers[0][0].startSession.callCount).to.equal(3);
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
      expect(session7.browser).to.equal(browsers[2][1]);
      expect(session7.status).to.equal(SESSION_STATUS.SCHEDULED);
      expect(browsers[2][0].startSession.called).to.equal(false);
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
      expect(session7.browser).to.equal(browsers[2][1]);
      expect(session7.status).to.equal(SESSION_STATUS.INITIALIZING);
      expect(browsers[2][0].startSession.callCount).to.equal(2);
    });
  });
});
