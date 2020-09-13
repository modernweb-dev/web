import { stub } from 'sinon';
import { expect } from 'chai';
import portfinder from 'portfinder';
import path from 'path';

import { TestRunnerCoreConfig } from '../../../src/config/TestRunnerCoreConfig';
import { TestRunner } from '../../../src/runner/TestRunner';
import { Logger } from '../../../src/logger/Logger';
import { SESSION_STATUS } from '../../../src/test-session/TestSessionStatus';
import { TestRunnerGroupConfig } from '../../../src';

function createBrowserStub() {
  return {
    name: 'myBrowser',
    type: 'myBrowser',
    start: stub().returns(Promise.resolve()),
    stop: stub().returns(Promise.resolve()),
    startDebugSession: stub().returns(Promise.resolve()),
    startSession: stub().returns(Promise.resolve()),
    stopSession: stub().returns(Promise.resolve({})),
    isActive: stub().returns(true),
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

  const config: TestRunnerCoreConfig = {
    files: [path.resolve(__dirname, '..', '..', 'fixtures', 'a.test.js')],
    reporters: [],
    logger,
    rootDir: process.cwd(),
    testFramework: { path: 'my-framework.js' },
    concurrency: 10,
    browsers: [browser],
    watch: false,
    protocol: 'http:',
    hostname: 'localhost',
    browserStartTimeout: 1000,
    testsStartTimeout: 1000,
    testsFinishTimeout: 1000,
    port,
    ...extraConfig,
  };
  const runner = new TestRunner(config, groupConfigs);
  return { runner, browser };
}

it('can run a single test file', async () => {
  const { browser, runner } = await createTestRunner();

  await runner.start();
  expect(runner.started).to.equal(true, 'runner is started');
  expect(browser.start.callCount).to.equal(1, 'brower is started');
  expect(browser.startSession.callCount).to.equal(1, 'browser session is started');

  const sessions = Array.from(runner.sessions.all());
  expect(sessions.length).to.equal(1, 'one session is created');
  await runner.stop();
});

it('closes test runner for a successful test', async () => {
  const { browser, runner } = await createTestRunner();
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

  expect(browser.stopSession.callCount).to.equal(1, 'browser session is stopped');
  expect(browser.stop.callCount).to.equal(1, 'browser is stopped');
  expect(passed).to.equal(true, 'test runner quits with true');
});

it('closes test runner for a failed test', async () => {
  const { browser, runner } = await createTestRunner();
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

  expect(browser.stopSession.callCount).to.equal(1, 'browser session is stopped');
  expect(browser.stop.callCount).to.equal(1, 'browser is stopped');
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
    const groupBrowser = createBrowserStub();
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
    const browserB = createBrowserStub();
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
});
