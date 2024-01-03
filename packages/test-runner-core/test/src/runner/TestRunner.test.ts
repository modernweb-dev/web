import * as hanbi from 'hanbi';
import { expect } from 'chai';
import portfinder from 'portfinder';
import path from 'path';

import { BrowserLauncher } from '../../../src/browser-launcher/BrowserLauncher.js';
import { TestRunnerCoreConfig } from '../../../src/config/TestRunnerCoreConfig.js';
import { TestRunner } from '../../../src/runner/TestRunner.js';
import { Logger } from '../../../src/logger/Logger.js';
import { SESSION_STATUS } from '../../../src/test-session/TestSessionStatus.js';
import { TestRunnerGroupConfig } from '../../../src/index.js';

interface BrowserStubs {
  stop: hanbi.Stub<Exclude<BrowserLauncher['stop'], undefined>>;
  startDebugSession: hanbi.Stub<BrowserLauncher['startDebugSession']>;
  startSession: hanbi.Stub<BrowserLauncher['startSession']>;
  stopSession: hanbi.Stub<BrowserLauncher['stopSession']>;
  isActive: hanbi.Stub<BrowserLauncher['isActive']>;
  getBrowserUrl: hanbi.Stub<BrowserLauncher['getBrowserUrl']>;
}

function createBrowserStub(): [BrowserStubs, BrowserLauncher] {
  const spies = {
    stop: hanbi.spy(),
    getBrowserUrl: hanbi.spy(),
    startDebugSession: hanbi.spy(),
    startSession: hanbi.spy(),
    stopSession: hanbi.spy(),
    isActive: hanbi.spy(),
  };
  spies.stop.returns(Promise.resolve());
  spies.getBrowserUrl.returns('');
  spies.startDebugSession.returns(Promise.resolve());
  spies.startSession.returns(Promise.resolve());
  spies.stopSession.returns(Promise.resolve({}));
  spies.isActive.returns(true);
  return [
    spies,
    {
      name: 'myBrowser',
      type: 'myBrowser',
      stop: spies.stop.handler,
      getBrowserUrl: spies.getBrowserUrl.handler,
      startDebugSession: spies.startDebugSession.handler,
      startSession: spies.startSession.handler,
      stopSession: spies.stopSession.handler,
      isActive: spies.isActive.handler,
    },
  ];
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

  const [browserStubs, browser] = createBrowserStub();

  console.log(path.resolve(__dirname, '..', '..', '..', '..', '..'));

  const config: TestRunnerCoreConfig = {
    files: [path.resolve(__dirname, '..', '..', 'fixtures', 'a.test.js')],
    reporters: [],
    logger,
    rootDir: path.resolve(__dirname, '..', '..', '..', '..', '..'),
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
  return { runner, browser, browserStubs };
}

describe('TestRunner', function () {
  it('can run a single test file', async () => {
    const { runner, browserStubs } = await createTestRunner();

    await runner.start();
    expect(runner.started).to.equal(true, 'runner is started');
    expect(browserStubs.startSession.callCount).to.equal(1);

    const sessions = Array.from(runner.sessions.all());
    expect(sessions.length).to.equal(1, 'one session is created');
    await runner.stop();
  });

  it('closes test runner for a successful test', async () => {
    const { runner, browserStubs } = await createTestRunner();
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

    expect(browserStubs.stopSession.callCount).to.equal(1, 'browser session is stopped');
    expect(browserStubs.stop.callCount).to.equal(1, 'browser is stopped');
    expect(passed).to.equal(true, 'test runner quits with true');
  });

  it('closes test runner for a failed test', async () => {
    const { runner, browserStubs } = await createTestRunner();
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

    expect(browserStubs.stopSession.callCount).to.equal(1, 'browser session is stopped');
    expect(browserStubs.stop.callCount).to.equal(1, 'browser is stopped');
    expect(passed).to.equal(false, 'test runner quits with false');
  });

  describe('groups', () => {
    it('can create a group in addition to the default group', async () => {
      const { runner } = await createTestRunner(undefined, [
        {
          name: 'a',
          files: [path.join(__dirname, '..', '..', 'fixtures', 'group-a', '*.test.js')],
        },
      ]);

      const sessions = Array.from(runner.sessions.all());
      expect(sessions.length).to.equal(3);
      expect(sessions.filter(s => s.group.name === 'default').length).to.equal(1);
      expect(sessions.filter(s => s.group.name === 'a').length).to.equal(2);
    });

    it('can create a group with a custom browser, inheriting test files', async () => {
      const [, groupBrowser] = createBrowserStub();
      const { browser, runner } = await createTestRunner(undefined, [
        {
          name: 'a',
          browsers: [groupBrowser],
        },
      ]);

      const sessions = Array.from(runner.sessions.all());
      expect(sessions.length).to.equal(2);
      expect(sessions.filter(s => s.group.name === 'default').length).to.equal(1);
      expect(sessions.filter(s => s.group.name === 'a').length).to.equal(1);

      const sessionDefault = sessions.find(s => s.group.name === 'default')!;
      const sessionA = sessions.find(s => s.group.name === 'a')!;
      expect(sessionDefault.testFile).to.equal(sessionA.testFile);
      expect(sessionDefault.browser).to.equal(browser);
      expect(sessionA.browser).to.equal(groupBrowser);
    });

    it('can create test groups inheriting browser', async () => {
      const { runner } = await createTestRunner(
        {
          files: undefined,
        },
        [
          {
            name: 'a',
            files: [path.join(__dirname, '..', '..', 'fixtures', 'group-a', '*.test.js')],
          },
          {
            name: 'b',
            files: [path.join(__dirname, '..', '..', 'fixtures', 'group-b', '*.test.js')],
          },
          {
            name: 'c',
            files: [path.join(__dirname, '..', '..', 'fixtures', 'group-c', '*.test.js')],
          },
        ],
      );

      const sessions = Array.from(runner.sessions.all());
      expect(sessions.length).to.equal(6);
      expect(sessions.filter(s => s.group.name === 'a').length).to.equal(2);
      expect(sessions.filter(s => s.group.name === 'b').length).to.equal(2);
      expect(sessions.filter(s => s.group.name === 'c').length).to.equal(2);
    });

    it('can create test groups with custom browsers', async () => {
      const [, browserB] = createBrowserStub();
      const { browser, runner } = await createTestRunner(
        {
          files: undefined,
        },
        [
          {
            name: 'a',
            files: [path.join(__dirname, '..', '..', 'fixtures', 'group-a', 'a-1.test.js')],
          },
          {
            name: 'b',
            browsers: [browserB],
            files: [path.join(__dirname, '..', '..', 'fixtures', 'group-b', 'b-1.test.js')],
          },
        ],
      );

      const sessions = Array.from(runner.sessions.all());
      expect(sessions.length).to.equal(2);
      expect(sessions.find(s => s.group.name === 'a')!.browser).to.equal(browser);
      expect(sessions.find(s => s.group.name === 'b')!.browser).to.equal(browserB);
    });

    it('can ignore files via string[] globs', async () => {
      const normalize = (x: string): string => x.replace(/\//g, path.sep);
      const { runner } = await createTestRunner({
        files: ['test/fixtures/**/*.test.js', '!test/fixtures/group-c/*'].map(normalize),
      });

      const sessions = Array.from(runner.sessions.all());
      const allFiles = sessions.flatMap(x => path.relative(__dirname, x.testFile));
      expect(allFiles).to.deep.equal(
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
