import chai, { expect } from 'chai';
import { SinonStub, stub } from 'sinon';
import sinonChai from 'sinon-chai';

import { BrowserLauncher } from '../../../src/browser-launcher/BrowserLauncher';

import { TestRunnerCoreConfig } from '../../../src/config/TestRunnerCoreConfig';
import { TestScheduler } from '../../../src/runner/TestScheduler';
import { TestSession } from '../../../src/test-session/TestSession';
import { TestSessionManager } from '../../../src/test-session/TestSessionManager';
import { SESSION_STATUS } from '../../../src/test-session/TestSessionStatus';

chai.use(sinonChai);

function timeout(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

describe('TestScheduler', () => {
  let mockConfig: TestRunnerCoreConfig;

  function createSession(session: Partial<TestSession>): TestSession {
    return ({
      ...session,
      testFile: `test-${session.id}.js`,
      browser: {
        startSession: stub().returns(timeout(1)),
        stopSession: stub().returns(timeout(1).then(() => ({ testCoverage: {} }))),
        isActive: stub().returns(true),
      } as Partial<BrowserLauncher>,
      status: SESSION_STATUS.SCHEDULED,
    } as Partial<TestSession>) as TestSession;
  }

  function createTestFixture(
    ...ids: string[]
  ): [TestScheduler, TestSessionManager, ...TestSession[]] {
    const sessionManager = new TestSessionManager();
    const sessions: TestSession[] = [];
    for (const id of ids) {
      const session = createSession({ id });
      sessions.push(session);
      sessionManager.add(session);
    }
    const scheduler = new TestScheduler(mockConfig, sessionManager);
    return [scheduler, sessionManager, ...sessions];
  }

  beforeEach(() => {
    mockConfig = ({
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
      concurrency: 2,
      browserStartTimeout: 1000,
      testsStartTimeout: 1000,
      testsFinishTimeout: 1000,
    } as Partial<TestRunnerCoreConfig>) as TestRunnerCoreConfig;
  });

  it('scheduling a session starts the browser and marks initializing', async () => {
    const [scheduler, sessions, session1] = createTestFixture('1');
    scheduler.schedule(1, [session1]);

    const finalSession1 = sessions.get(session1.id)!;
    expect(finalSession1.status).to.equal(SESSION_STATUS.INITIALIZING);
    expect(finalSession1.browser.startSession).to.be.calledOnce;
  });

  it('when a session goes to status test finished, the browser is stopped and results is stored', async () => {
    const [scheduler, sessions, session1] = createTestFixture('1');
    const testCoverage = { foo: 'bar' };
    (session1.browser.stopSession as SinonStub).returns(timeout(1).then(() => ({ testCoverage })));
    scheduler.schedule(1, [session1]);

    await timeout(2);
    sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_FINISHED);
    await timeout(2);

    const finalSession1 = sessions.get(session1.id)!;
    expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
    expect(finalSession1.passed).to.equal(true);
    expect(finalSession1.testCoverage).to.equal(testCoverage);
  });

  it('batches test execution', async () => {
    const [scheduler, sessions, ...sessionsToSchedule] = createTestFixture('1', '2', '3');
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
    await timeout(2);

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
    const [scheduler, sessions, ...sessionsToSchedule] = createTestFixture(...sessionIds);

    // schedule 2 sessions
    scheduler.schedule(1, sessionsToSchedule.slice(0, 2));

    expect(sessions.get('1')!.status).to.equal(SESSION_STATUS.INITIALIZING);
    expect(sessions.get('2')!.status).to.equal(SESSION_STATUS.INITIALIZING);

    // schedule 3 more sessions after browser starts
    await timeout(2);
    scheduler.schedule(1, sessionsToSchedule.slice(2, 5));
    expect(sessions.get('1')!.status).to.equal(SESSION_STATUS.INITIALIZING);
    expect(sessions.get('2')!.status).to.equal(SESSION_STATUS.INITIALIZING);
    expect(sessions.get('3')!.status).to.equal(SESSION_STATUS.SCHEDULED);
    expect(sessions.get('4')!.status).to.equal(SESSION_STATUS.SCHEDULED);
    expect(sessions.get('5')!.status).to.equal(SESSION_STATUS.SCHEDULED);

    // mark first test as finished
    sessions.updateStatus({ ...sessions.get('1')!, passed: true }, SESSION_STATUS.TEST_FINISHED);

    // wait for browser to end
    await timeout(2);

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
    const [scheduler, sessions, session1] = createTestFixture('1');
    (session1.browser.startSession as SinonStub).callsFake(() =>
      Promise.reject(new Error('mock error')),
    );
    scheduler.schedule(1, [session1]);

    await timeout(3);

    const finalSession1 = sessions.get(session1.id)!;
    expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
    expect(finalSession1.passed).to.equal(false);
    expect(finalSession1.errors.length).to.equal(1);
    expect(finalSession1.errors[0].message).to.equal('mock error');
  });

  it('error while starting browser after a session changed state gets logged', async () => {
    const errorStub = stub(mockConfig.logger, 'error');
    const [scheduler, sessions, session1] = createTestFixture('1');
    (session1.browser.startSession as SinonStub).returns(
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

    expect(errorStub).to.be.calledOnce;
    expect(errorStub.getCall(0).args[0]).to.an.instanceof(Error);
    expect((errorStub.getCall(0).args[0] as Error).message).to.equal('mock error');
  });

  it('error while stopping browser marks session as failed', async () => {
    const [scheduler, sessions, session1] = createTestFixture('1');
    (session1.browser.stopSession as SinonStub).callsFake(() =>
      Promise.reject(new Error('mock error')),
    );
    scheduler.schedule(1, [session1]);

    await timeout(2);
    sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_FINISHED);
    await timeout(2);

    const finalSession1 = sessions.get(session1.id)!;
    expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
    expect(finalSession1.passed).to.equal(false);
    expect(finalSession1.errors.length).to.equal(1);
    expect(finalSession1.errors[0].message).to.equal('mock error');
  });

  it('timeout starting the browser marks the session as failed', async () => {
    mockConfig.browserStartTimeout = 2;
    const [scheduler, sessions, session1] = createTestFixture('1');
    (session1.browser.startSession as SinonStub).returns(timeout(4));
    scheduler.schedule(1, [session1]);

    await timeout(3);

    const finalSession1 = sessions.get(session1.id)!;
    expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
    expect(finalSession1.passed).to.equal(false);
    expect(finalSession1.errors.length).to.equal(1);
    expect(finalSession1.errors[0].message).to.equal(
      'The browser was unable to open the test page after 2ms.',
    );
  });

  it('timeout starting the tests marks the session as failed', async () => {
    mockConfig.testsStartTimeout = 2;
    const [scheduler, sessions, session1] = createTestFixture('1');
    scheduler.schedule(1, [session1]);

    await timeout(8);

    const finalSession1 = sessions.get(session1.id)!;
    expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
    expect(finalSession1.passed).to.equal(false);
    expect(finalSession1.errors.length).to.equal(1);
    expect(finalSession1.errors[0].message).to.equal(
      'Browser tests did not start after 2ms. Check the browser logs or open the browser in debug mode for more information.',
    );
  });

  it('timeout finishing the tests marks the session as failed', async () => {
    mockConfig.testsFinishTimeout = 2;
    const [scheduler, sessions, session1] = createTestFixture('1');
    scheduler.schedule(1, [session1]);

    await timeout(1);
    sessions.updateStatus({ ...session1, passed: true }, SESSION_STATUS.TEST_STARTED);
    await timeout(3);

    const finalSession1 = sessions.get(session1.id)!;
    expect(finalSession1.status).to.equal(SESSION_STATUS.FINISHED);
    expect(finalSession1.passed).to.equal(false);
    expect(finalSession1.errors.length).to.equal(1);
    expect(finalSession1.errors[0].message).to.equal(
      'Browser tests did not finish within 2ms. Check the browser logs or open the browser in debug mode for more information.',
    );
  });
});
