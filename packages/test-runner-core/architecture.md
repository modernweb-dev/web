# Test Runner Core

## Projects

- `@web/test-runner-core` implements the basics of the test runner.
- `@web/test-runner` reads command line args, starts the test runner, and adds default opinionated plugins, test framework and reporter.
- `@web/dev-server-core` is used as web server in the test runner.
- `@web/config-loader` is used to read the config.
- `@web/browser-logs` is used to serialize browser logs, and deserialize them on the server.
- `@web/test-runner-mocha` is a test framework implementation.
- `@web/test-runner-{chrome, puppeteer, playwright, webdriver, saucelabs, browserstack}` are browser launcher implementations.
- `@web/test-runner-junit-reporter` is a test reporter. `@web/test-runner` contains the default reporter.
- `@web/test-runner-commands` implements some default commands.
- `@web/test-runner-visual-regression` is a plugin for visual regression testing.
- `@web/test-runner-coverage-v8` is used for instrumenting test coverage using chromium.

- `@web/test-runner-cli` is now deprecated, and no longer used.

## Lifecycle of a test

This describes the lifecycle of a test file through the different parts of the test runner. Code snippets are simplified for clarity.

Let's say we are running tests using the default implementation of `@web/test-runner` and we have a config that looks like this:

```js
import { playwrightLauncher } from '@web/test-runner-chrome';

export default {
  files: 'test/my-test.test.js',
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
  ],
};
```

The `TestRunner` class is instantiated with this config, and creates two test sessions:

```js
const defaultGroup = {
  name: 'default',
  testFiles: ['/my-project/test/my-test.test.js'],
  browsers: config.browsers,
  sessionIds: ['<uuid 1>', '<uuid 2>'],
};

const testSessions = [
  {
    id: '<uuid 1>',
    group: defaultGroup,
    browser: config.browsers[0],
    testFile: '/my-project/test/my-test.test.js',
    status: SESSION_STATUS.SCHEDULED,
  },
  {
    id: '<uuid 2>',
    group: defaultGroup,
    browser: config.browsers[1],
    testFile: '/my-project/test/my-test.test.js',
    status: SESSION_STATUS.SCHEDULED,
  },
];
```

These test sessions are handed to the `TestScheduler` which boots up the browsers and runs the tests:

```js
for (const session of testSessions) {
  const url = createSessionUrl(session);
  session.browser.startSession(session.id, url);
}
```

The test URL looks like this: `/?wtr-session-id=<uuid>`

And the served HTML page like this:

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module" src="/test-framework.js"></script>
  </body>
</html>
```

The browser opens up the test URL in the browser where the configured test framework is loaded. The test framework now takes care of running your test file. For mocha it looks something like this:

```js
import {
  sessionStarted,
  getConfig,
  sessionFinished,
} from '@web/test-runner-core/browser/session.js';
import 'mocha/mocha.js';

sessionStarted();
const { testFile } = await getConfig();

await import(testFile);

mocha.run(testResults => {
  sessionFinished(testResults);
});
```

The browser has a websocket connection with the server. The test framework first communicates that the test session has started and later that it has finished. These updates are received by the server and communicated to the `TestSessionManager`. This fires events to notify the different parts of the test runner about these changes. For example to update progress logging.

After the scheduler starts a test session in the browser, it waits for the manager to notify that the session has finished. The scheduler will then close the browser, and collect data like test coverage from the browser.

```js
testSessionManager.on('session-status-updated', async session => {
  if (session.status === SESSION_STATUS.TEST_FINISHED) {
    const { testCoverage, errors } = await session.browser.stopSession(session.id);
    const updatedSession = { ...session, errors, testCoverage };
    testSessionManager.updateStatus(updatedSession, SESSION_STATUS.FINISHED);
  }
});
```

This concludes the lifecycle of a test session. If it's a single test run, the test runner will wait for all tests to finish and exit. In watch mode, editing a file will trigger schedule a test session again and the cycle starts again from the beginning.

## Overview

This is an overview of the different components and data structures of the test runner.

### TestRunner

`TestRunner` is the main class that kicks off the test runner. It fires events notifying when individual test runs start, finish and when testing in general has finished. It contains a number of properties that contain information about the status of the test runner.

```js
const runner = new TestRunner(config, testGroupConfigs);
await runner.start();

runner.on('test-run-started', () => {
  // ...
});
runner.on('finished', () => {
  // ...
});

console.log(runner.config); // TestRunnerCoreConfig
console.log(runner.sessions); // TestSessionManager (see below)
console.log(runner.testFiles); // string[]
console.log(runner.browsers); // BrowserLauncher[] (taken from the config)
console.log(runner.browserNames); // string[]
console.log(runner.testRun); // number
console.log(runner.started); // boolean
console.log(runner.stopped); // boolean
console.log(runner.finished); // boolean
console.log(runner.passed); // boolean

await runner.stop();
```

### TestSessionManager

The `TestSessionManager` is created by the `TestRunner` class. It's a wrapper around multiple data structures that represent the status of the tests being executed by the test runner. It contains methods to update the status of test sessions, and to easily query different subsets. The manager fires events to notify about changes. The manager is mutable, but test sessions are immutable.

The manager is available from the test runner:

```js
const runner = new TestRunner(config, testGroupConfigs);
await runner.start();

console.log(runner.sessions.all());
console.log(runner.sessions.get(sessionId));
console.log(runner.sessions.forStatus(SESSION_STATUS.FINISHED));
console.log(runner.sessions.forBrowserName('chromium'));
console.log(runner.sessions.failed());
console.log(runner.sessions.passed());
console.log(runner.sessions.updateStatus(session, SESSION_STATUS.FINISHED));
```

### TestSession

A test session is a combination of a combination of a browser and a testfile. For example if you have test file A and B, and run them on the browsers chromium and firefox, there would be four total test sessions representing all the combinations.

The `TestSession` data structure represents these individual combinations, and contains information about the status and test results. The status property is updated over time as the test session executed. It's implemented as a regular javascript object, and should be treated as immutable.

### TestSessionGroup

A test group is a way to group together related tests which share the same configuration options. A user can do this from the config, using the `groups` entry. For example to execute a group of tests only on a certain browser, or to execute tests in a different HTML environment.

A default group is always created as well, this contains all the default options from the top level config.

### TestScheduler

The scheduler is created by the test runner, and is not exposed as a public property. It manages the actual execution of a test session, and communicates with the browser launcher.

For each test run tests are scheduled for execution. The scheduler will pick up these tests. It start up the browsers, executes the tests and gathers the test results. Multiple tests are executed concurrently, based on the concurrency settings. The other tests are queued until there is space available.

### TestRunnerServer

The test runner server is a wrapper around `@web/dev-server-core`. It sets up web dev server for serving the user's test files, and adds plugins and middleware necessary for the test runner.

### TestRunnerCli

The `TestRunnerCli` is responsible for reporting test results and progress to the terminal, and responding to user input from the interactive watch menu.

Reporting test results and progress is implemented by reporters. The default reporter is implemented in `@web/test-runner`. Different reporters can be configured by a user from the config.

The CLI is created separately from the test runner. It accepts the test runner instance in the constructor, so that it can communicate with it.

```js
const runner = new TestRunner(config, testGroupConfigs);
const cli = new TestRunnerCli(config, runner);

await runner.start();
cli.start();
```

### BrowserLauncher

A `BrowserLauncher` is an interface for communicating with a browser. It's responsible for booting up a browser, navigating to a test URL and returning the test results. The core projects doesn't implement any default browser launcher.

### TestFramework

A `TestFramework` is responsible for executing a test file in the browser, and pinging back the results. The core doesn't implement any test framework by default. `@web/test-runner-mocha` is included by default in `@web/test-runner`.
