import { stub } from 'sinon';
import { expect } from 'chai';
import { TestRunnerConfig } from '../src/runner/TestRunnerConfig';
import { TestRunner } from '../src/runner/TestRunner';
import { SESSION_STATUS } from '../src/test-session/TestSessionStatus';

async function timeout(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

function createTestRunner(extraConfig: Partial<TestRunnerConfig> = {}, testFiles = ['a.js']) {
  const browser = {
    start: stub().returns(Promise.resolve(['myBrowser'])),
    stop: stub().returns(Promise.resolve()),
    startDebugSession: stub().returns(Promise.resolve()),
    startSession: stub().returns(Promise.resolve()),
    stopSession: stub().returns(Promise.resolve()),
  };

  const server = {
    start: stub().returns(Promise.resolve()),
    stop: stub().returns(Promise.resolve()),
  };

  const config: TestRunnerConfig = {
    files: [],
    testFrameworkImport: 'my-framework.js',
    concurrency: 10,
    browsers: browser,
    server,
    address: 'http://localhost',
    port: 8000,
    ...extraConfig,
  };
  const runner = new TestRunner(config, testFiles);
  return { runner, browser, server };
}

it('can run a single test file', async () => {
  const { browser, server, runner } = createTestRunner();

  await runner.start();
  expect(runner.started).to.equal(true, 'runner is started');
  expect(browser.start.callCount).to.equal(1, 'brower is started');
  expect(server.start.callCount).to.equal(1, 'server is started');
  expect(browser.startSession.callCount).to.equal(1, 'browser session is started');

  const sessions = Array.from(runner.sessions.all());
  expect(sessions.length).to.equal(1, 'one session is created');
});

it('closes test runner for a succesful test', async () => {
  const { browser, server, runner } = createTestRunner();
  let quitResponse: boolean | null = null;

  await runner.start();
  runner.on('quit', response => {
    quitResponse = response;
  });

  const sessions = Array.from(runner.sessions.all());
  runner.sessions.updateStatus(sessions[0], SESSION_STATUS.FINISHED, { passed: true });

  expect(browser.stopSession.callCount).to.equal(1, 'browser session is stopped');
  await timeout();
  expect(browser.stop.callCount).to.equal(1, 'browser is stopped');
  expect(server.stop.callCount).to.equal(1, 'server is stopped');
  await timeout();
  expect(quitResponse).to.equal(true, 'test runner quits with true');
});

it('closes test runner for a failed test', async () => {
  const { browser, server, runner } = createTestRunner();
  let quitResponse: boolean | null = null;

  await runner.start();
  runner.on('quit', response => {
    quitResponse = response;
  });

  const sessions = Array.from(runner.sessions.all());
  runner.sessions.updateStatus(sessions[0], SESSION_STATUS.FINISHED, { passed: false });

  expect(browser.stopSession.callCount).to.equal(1, 'browser session is stopped');
  await timeout();
  expect(browser.stop.callCount).to.equal(1, 'browser is stopped');
  expect(server.stop.callCount).to.equal(1, 'server is stopped');
  await timeout();
  expect(quitResponse).to.equal(false, 'test runner quits with false');
});
