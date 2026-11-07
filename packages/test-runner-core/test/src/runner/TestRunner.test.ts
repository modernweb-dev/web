import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it, mock } from 'node:test';
import { setImmediate } from 'node:timers/promises';

import portfinder from 'portfinder';

import type {
  BrowserLauncher,
  SessionResult,
} from '../../../dist/browser-launcher/BrowserLauncher.js';
import type { TestRunnerCoreConfig } from '../../../dist/config/TestRunnerCoreConfig.js';
import type { TestRunnerGroupConfig } from '../../../dist/index.js';
import type { Logger } from '../../../dist/logger/Logger.js';
import { TestRunner } from '../../../dist/runner/TestRunner.js';
import { TestRunnerServer } from '../../../dist/server/TestRunnerServer.js';
import { SESSION_STATUS } from '../../../dist/test-session/TestSessionStatus.js';

function createBrowserStub(): BrowserLauncher {
  return {
    name: 'myBrowser',
    type: 'myBrowser',
    stop: mock.fn(() => Promise.resolve()),
    getBrowserUrl: mock.fn(() => ''),
    startDebugSession: mock.fn(() => Promise.resolve()),
    startSession: mock.fn(() => Promise.resolve()),
    stopSession: mock.fn(() => Promise.resolve({})),
    isActive: mock.fn(() => true),
  };
}

const logger: Logger = {
  ...console,
  debug() {
    //
  },
  logSyntaxError(error) {
    console.log(error);
  },
};

async function createTestRunner(
  extraConfig: Partial<TestRunnerCoreConfig> = {},
  groupConfigs?: TestRunnerGroupConfig[],
) {
  const port = await portfinder.getPortPromise({
    port: 9000 + Math.floor(Math.random() * 1000),
  });

  const browser = createBrowserStub();

  console.log(path.resolve(import.meta.dirname, '..', '..', '..', '..', '..'));

  const config: TestRunnerCoreConfig = {
    files: [path.resolve(import.meta.dirname, '..', '..', 'fixtures', 'a.test.js')],
    reporters: [],
    logger,
    rootDir: path.resolve(import.meta.dirname, '..', '..', '..', '..', '..'),
    testFramework: { path: 'my-framework.js' },
    concurrentBrowsers: 2,
    concurrency: 10,
    browsers: [browser],
    watch: false,
    protocol: 'http:',
    hostname: 'localhost',
    browserStartTimeout: 1000,
    testsStartTimeout: 1000,
    testsFinishTimeout: 1000,
    coverageConfig: {
      report: false,
      reportDir: process.cwd(),
    },
    port,
    ...extraConfig,
  };
  const runner = new TestRunner(config, groupConfigs);
  return { runner, browser };
}

describe('TestRunner', function () {
  it('can run a single test file', async () => {
    const { runner, browser } = await createTestRunner();

    await runner.start();
    assert.equal(runner.started, true, 'runner is started');
    assert.equal(browser.startSession.mock.callCount(), 1);

    const sessions = Array.from(runner.sessions.all());
    assert.equal(sessions.length, 1, 'one session is created');
    await runner.stop();
  });

  it('closes test runner for a successful test', async () => {
    const { runner, browser } = await createTestRunner();
    let resolveStopped: (passed: boolean) => void;
    const stopped = new Promise<boolean>(resolve => {
      resolveStopped = resolve;
    });
    runner.on('finished', () => {
      runner.stop();
    });
    runner.on('stopped', passed => {
      resolveStopped(passed);
    });

    await runner.start();

    const sessions = Array.from(runner.sessions.all());
    runner.sessions.updateStatus({ ...sessions[0], passed: true }, SESSION_STATUS.TEST_FINISHED);

    const passed = await stopped;

    assert.equal(browser.stopSession.mock.callCount(), 1, 'browser session is stopped');
    assert.equal(browser.stop.mock.callCount(), 1, 'browser is stopped');
    assert.equal(passed, true, 'test runner quits with true');
  });

  it('closes test runner for a failed test', async () => {
    const { runner, browser } = await createTestRunner();
    let resolveStopped: (passed: boolean) => void;
    const stopped = new Promise<boolean>(resolve => {
      resolveStopped = resolve;
    });
    runner.on('finished', () => {
      runner.stop();
    });
    runner.on('stopped', passed => {
      resolveStopped(passed);
    });

    await runner.start();

    const sessions = Array.from(runner.sessions.all());
    runner.sessions.updateStatus({ ...sessions[0], passed: false }, SESSION_STATUS.TEST_FINISHED);
    const passed = await stopped;

    assert.equal(browser.stopSession.mock.callCount(), 1, 'browser session is stopped');
    assert.equal(browser.stop.mock.callCount(), 1, 'browser is stopped');
    assert.equal(passed, false, 'test runner quits with false');
  });

  for (const cleanupPending of [false, true]) {
    it(
      cleanupPending
        ? 'waits for in-flight page cleanup during shutdown'
        : 'closes the browser after completed page cleanup during shutdown',
      async () => {
        const { runner, browser } = await createTestRunner({ watch: true });
        const [session] = Array.from(runner.sessions.all());
        const pageStopped = Promise.withResolvers<SessionResult>();
        const testCoverage = {};
        const stopped = mock.fn();
        let finishing: Promise<void> | undefined;
        let stopping: Promise<void> | undefined;
        runner.on('stopped', stopped);
        browser.stopSession.mock.mockImplementation(() => pageStopped.promise);

        try {
          await runner.start();
          await setImmediate();
          assert.equal(browser.startSession.mock.callCount(), 1);
          finishing = new Promise<void>(resolve => {
            const onStatus = (updatedSession: typeof session) => {
              if (
                updatedSession.id === session.id &&
                updatedSession.status === SESSION_STATUS.FINISHED
              ) {
                runner.sessions.off('session-status-updated', onStatus);
                resolve();
              }
            };
            runner.sessions.on('session-status-updated', onStatus);
          });
          runner.sessions.updateStatus(
            { ...runner.sessions.get(session.id)!, passed: true },
            SESSION_STATUS.TEST_FINISHED,
          );
          assert.equal(browser.stopSession.mock.callCount(), 1, 'page cleanup has started');

          if (!cleanupPending) {
            pageStopped.resolve({ testCoverage });
            await finishing;
          }
          stopping = runner.stop();
          await setImmediate();
          if (cleanupPending) {
            assert.equal(
              browser.stop.mock.callCount(),
              0,
              'browser shutdown must wait for in-flight page cleanup',
            );
            assert.equal(
              stopped.mock.callCount(),
              0,
              'shutdown must not finish before page cleanup',
            );
          }
        } finally {
          pageStopped.resolve({ testCoverage });
          await finishing;
          await stopping;
          await runner.stop();
        }

        assert.equal(browser.stop.mock.callCount(), 1, 'the browser is closed after cleanup');
        assert.equal(stopped.mock.callCount(), 1, 'shutdown completes exactly once');
        assert.equal(runner.sessions.get(session.id)!.status, SESSION_STATUS.FINISHED);
        assert.equal(runner.sessions.get(session.id)!.testCoverage, testCoverage);
      },
    );
  }

  it('waits for browser cleanup created by page cleanup during shutdown', async t => {
    const { runner, browser } = await createTestRunner();
    const stopServer = t.mock.method(TestRunnerServer.prototype, 'stop');
    const pageStopped = Promise.withResolvers<SessionResult>();
    const browserStopping = Promise.withResolvers<void>();
    const browserStopped = Promise.withResolvers<void>();
    const stopped = mock.fn();
    let stopping: Promise<void> | undefined;
    runner.on('stopped', stopped);
    browser.stopSession.mock.mockImplementation(() => pageStopped.promise);
    browser.stop.mock.mockImplementation(() => {
      browserStopping.resolve();
      return browserStopped.promise;
    });

    try {
      await runner.start();
      await setImmediate();
      const [session] = Array.from(runner.sessions.all());
      runner.sessions.updateStatus({ ...session, passed: true }, SESSION_STATUS.TEST_FINISHED);
      assert.equal(browser.stopSession.mock.callCount(), 1, 'page cleanup has started');
      stopping = runner.stop();
      pageStopped.resolve({});
      await browserStopping.promise;
      await setImmediate();

      assert.equal(
        stopServer.mock.callCount(),
        0,
        'server shutdown must wait for browser cleanup created by page cleanup',
      );
      assert.equal(
        stopped.mock.callCount(),
        0,
        'shutdown waits for the newly created browser cleanup',
      );
    } finally {
      pageStopped.resolve({});
      browserStopped.resolve();
      await stopping;
      await runner.stop();
    }

    assert.equal(browser.stop.mock.callCount(), 1);
    assert.equal(stopServer.mock.callCount(), 1);
    assert.equal(stopped.mock.callCount(), 1);
  });

  describe('groups', () => {
    it('can create a group in addition to the default group', async () => {
      const { runner } = await createTestRunner(undefined, [
        {
          name: 'a',
          files: [path.join(import.meta.dirname, '..', '..', 'fixtures', 'group-a', '*.test.js')],
        },
      ]);

      const sessions = Array.from(runner.sessions.all());
      assert.equal(sessions.length, 3);
      assert.equal(sessions.filter(s => s.group.name === 'default').length, 1);
      assert.equal(sessions.filter(s => s.group.name === 'a').length, 2);
    });

    it('can create a group with a custom browser, inheriting test files', async () => {
      const groupBrowser = createBrowserStub();
      const { browser, runner } = await createTestRunner(undefined, [
        {
          name: 'a',
          browsers: [groupBrowser],
        },
      ]);

      const sessions = Array.from(runner.sessions.all());
      assert.equal(sessions.length, 2);
      assert.equal(sessions.filter(s => s.group.name === 'default').length, 1);
      assert.equal(sessions.filter(s => s.group.name === 'a').length, 1);

      const sessionDefault = sessions.find(s => s.group.name === 'default')!;
      const sessionA = sessions.find(s => s.group.name === 'a')!;
      assert.equal(sessionDefault.testFile, sessionA.testFile);
      assert.equal(sessionDefault.browser, browser);
      assert.equal(sessionA.browser, groupBrowser);
    });

    it('can create test groups inheriting browser', async () => {
      const { runner } = await createTestRunner(
        {
          files: undefined,
        },
        [
          {
            name: 'a',
            files: [path.join(import.meta.dirname, '..', '..', 'fixtures', 'group-a', '*.test.js')],
          },
          {
            name: 'b',
            files: [path.join(import.meta.dirname, '..', '..', 'fixtures', 'group-b', '*.test.js')],
          },
          {
            name: 'c',
            files: [path.join(import.meta.dirname, '..', '..', 'fixtures', 'group-c', '*.test.js')],
          },
        ],
      );

      const sessions = Array.from(runner.sessions.all());
      assert.equal(sessions.length, 6);
      assert.equal(sessions.filter(s => s.group.name === 'a').length, 2);
      assert.equal(sessions.filter(s => s.group.name === 'b').length, 2);
      assert.equal(sessions.filter(s => s.group.name === 'c').length, 2);
    });

    it('can create test groups with custom browsers', async () => {
      const browserB = createBrowserStub();
      const { browser, runner } = await createTestRunner(
        {
          files: undefined,
        },
        [
          {
            name: 'a',
            files: [
              path.join(import.meta.dirname, '..', '..', 'fixtures', 'group-a', 'a-1.test.js'),
            ],
          },
          {
            name: 'b',
            browsers: [browserB],
            files: [
              path.join(import.meta.dirname, '..', '..', 'fixtures', 'group-b', 'b-1.test.js'),
            ],
          },
        ],
      );

      const sessions = Array.from(runner.sessions.all());
      assert.equal(sessions.length, 2);
      assert.equal(sessions.find(s => s.group.name === 'a')!.browser, browser);
      assert.equal(sessions.find(s => s.group.name === 'b')!.browser, browserB);
    });

    it('can ignore files via string[] globs', async () => {
      const normalize = (x: string): string => x.replace(/\//g, path.sep);
      const { runner } = await createTestRunner({
        files: ['test/fixtures/**/*.test.js', '!test/fixtures/group-c/*'].map(normalize),
      });

      const sessions = Array.from(runner.sessions.all());
      const allFiles = sessions.flatMap(x => path.relative(import.meta.dirname, x.testFile));
      assert.deepEqual(
        allFiles,
        [
          '../../fixtures/a.test.js',
          '../../fixtures/group-a/a-1.test.js',
          '../../fixtures/group-a/a-2.test.js',
          '../../fixtures/group-b/b-1.test.js',
          '../../fixtures/group-b/b-2.test.js',
        ].map(normalize),
      );
    });
  });
});
