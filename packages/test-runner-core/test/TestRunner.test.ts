import { stub } from 'sinon';
import { expect } from 'chai';
import portfinder from 'portfinder';

import { TestRunnerCoreConfig } from '../src/config/TestRunnerCoreConfig';
import { TestRunner } from '../src/runner/TestRunner';
import { Logger } from '../src/logger/Logger';
import { SESSION_STATUS } from '../src/test-session/TestSessionStatus';

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
  testFiles = ['a.js'],
) {
  const port = await portfinder.getPortPromise({
    port: 9000 + Math.floor(Math.random() * 1000),
  });

  const browser = {
    start: stub().returns(Promise.resolve('myBrowser')),
    stop: stub().returns(Promise.resolve()),
    startDebugSession: stub().returns(Promise.resolve()),
    startSession: stub().returns(Promise.resolve()),
    stopSession: stub().returns(Promise.resolve({})),
    setViewport: stub().returns(Promise.resolve()),
  };

  const server = {
    start: stub().returns(Promise.resolve()),
    stop: stub().returns(Promise.resolve()),
  };

  const config: TestRunnerCoreConfig = {
    files: [],
    reporters: [],
    logger,
    rootDir: process.cwd(),
    testFramework: { path: 'my-framework.js' },
    concurrency: 10,
    browsers: browser,
    watch: false,
    server,
    protocol: 'http:',
    hostname: 'localhost',
    port,
    ...extraConfig,
  };
  const runner = new TestRunner(config, testFiles);
  return { runner, browser, server };
}

it('can run a single test file', async () => {
  const { browser, server, runner } = await createTestRunner();

  await runner.start();
  expect(runner.started).to.equal(true, 'runner is started');
  expect(browser.start.callCount).to.equal(1, 'brower is started');
  expect(server.start.callCount).to.equal(1, 'server is started');
  expect(browser.startSession.callCount).to.equal(1, 'browser session is started');

  const sessions = Array.from(runner.sessions.all());
  expect(sessions.length).to.equal(1, 'one session is created');
});

it('closes test runner for a succesful test', async () => {
  const { browser, server, runner } = await createTestRunner();
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
  expect(server.stop.callCount).to.equal(1, 'server is stopped');
  expect(passed).to.equal(true, 'test runner quits with true');
});

it('closes test runner for a failed test', async () => {
  const { browser, server, runner } = await createTestRunner();
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
  expect(server.stop.callCount).to.equal(1, 'server is stopped');
  expect(passed).to.equal(false, 'test runner quits with false');
});
