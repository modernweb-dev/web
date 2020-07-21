import path from 'path';
import { expect } from 'chai';
import { TestRunnerConfig, TestRunner } from '@web/test-runner-core';
import { testRunnerServer } from '@web/test-runner-server';
import portfinder from 'portfinder';

import { browserstackLauncher } from '../src/browserstackLauncher';

let runner: TestRunner;

it('runs tests with selenium', async function (done) {
  const port = await portfinder.getPortPromise({
    port: 9000 + Math.floor(Math.random() * 1000),
  });
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

  const config: TestRunnerConfig = {
    files: [],
    watch: false,
    testFrameworkImport: '@web/test-runner-mocha/dist/autorun.js',
    rootDir: path.join(process.cwd(), '..', '..'),
    address: 'http://localhost',
    reporters: [],
    port,
    concurrency: 4,
    browserStartTimeout: 120000,
    sessionStartTimeout: 120000,
    sessionFinishTimeout: 120000,
    browsers: [
      browserstackLauncher({
        capabilities: {
          ...sharedCapabilities,
          browserName: 'Safari',
          browser_version: '11.1',
          os: 'OS X',
          os_version: 'High Sierra',
        },
      }),
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
    server: testRunnerServer(),
  };

  runner = new TestRunner(config, [
    'test/fixtures/test-a.test.js',
    'test/fixtures/test-b.test.js',
    'test/fixtures/test-c.test.js',
  ]);

  runner.on('quit', () => {
    const sessions = Array.from(runner.sessions.all());
    expect(sessions.length).to.equal(6, 'there should be 9 test sessions');

    for (const session of sessions) {
      if (!session.passed) {
        if (session.error instanceof Error) {
          done(session.error);
        } else if (session.error) {
          done(new Error(session.error.message));
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
