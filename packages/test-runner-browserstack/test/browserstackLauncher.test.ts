import path from 'path';
import { expect } from 'chai';
import { TestRunnerCoreConfig, TestRunner, Logger } from '@web/test-runner-core';
import { testRunnerServer } from '@web/test-runner-server';
import { legacyPlugin } from '@web/dev-server-legacy';
import portfinder from 'portfinder';

import { browserstackLauncher } from '../src/browserstackLauncher';

let runner: TestRunner;
let port: number;
beforeEach(async () => {
  port = await portfinder.getPortPromise({
    port: 9000 + Math.floor(Math.random() * 1000),
  });
});

const logger: Logger = {
  ...console,
  debug() {
    //
  },
  logSyntaxError(error) {
    console.error(error);
  },
};

it('runs tests with browserstack', function (done) {
  this.timeout(1000 * 60 * 5);

  const sharedCapabilities = {
    'browserstack.user': process.env.BROWSER_STACK_USERNAME,
    'browserstack.key': process.env.BROWSER_STACK_ACCESS_KEY,

    project: '@web/test-runner-browserstack',
    name: 'integration test',
    build: `modern-web ${process.env.GITHUB_REF ?? 'local'} build ${
      process.env.GITHUB_RUN_NUMBER ?? ''
    }`,
  };

  const config: TestRunnerCoreConfig = {
    files: [],
    watch: false,
    testFramework: { path: require.resolve('@web/test-runner-mocha/dist/autorun.js') },
    rootDir: path.join(process.cwd(), '..', '..'),
    protocol: 'http:',
    hostname: 'localhost',
    port,
    logger,
    reporters: [],
    concurrency: 4,
    browserStartTimeout: 120000,
    testsStartTimeout: 120000,
    testsFinishTimeout: 120000,
    browsers: [
      // browserstackLauncher({
      //   capabilities: {
      //     ...sharedCapabilities,
      //     browserName: 'Chrome',
      //     browser_version: 'latest',
      //     os: 'windows',
      //     os_version: '10',
      //   },
      // }),
      // browserstackLauncher({
      //   capabilities: {
      //     ...sharedCapabilities,
      //     browserName: 'Safari',
      //     browser_version: '11.1',
      //     os: 'OS X',
      //     os_version: 'High Sierra',
      //   },
      // }),
      browserstackLauncher({
        capabilities: {
          ...sharedCapabilities,
          browserName: 'IE',
          browser_version: '11.0',
          os: 'Windows',
          os_version: '7',
        },
      }),
    ],
    server: testRunnerServer({
      plugins: [legacyPlugin()],
    }),
  };

  runner = new TestRunner(config, [
    'test/fixtures/test-a.test.js',
    'test/fixtures/test-b.test.js',
    'test/fixtures/test-c.test.js',
  ]);

  runner.sessions.on('session-status-updated', session => {
    console.log(session.browser.name, session.id, session.status);
  });

  runner.on('finished', () => {
    runner.stop();
  });

  runner.on('stopped', () => {
    const sessions = Array.from(runner.sessions.all());
    expect(sessions.length).to.equal(3, 'there should be 6 test sessions');

    for (const session of sessions) {
      if (!session.passed) {
        const error = session.errors[0];
        if (error instanceof Error) {
          done(error);
        } else if (error) {
          done(new Error(error.message));
        } else {
          done(new Error('unknown error'));
        }
        return;
      }
    }

    done();
  });

  runner.start();
});
