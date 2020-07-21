import path from 'path';
import { expect } from 'chai';
import { TestRunnerCoreConfig, TestRunner, Logger } from '@web/test-runner-core';
import { testRunnerServer } from '@web/test-runner-server';
import portfinder from 'portfinder';

import { puppeteerLauncher } from '../src/puppeteerLauncher';

let port: number;
beforeEach(async () => {
  port = await portfinder.getPortPromise({
    port: 9000 + Math.floor(Math.random() * 1000),
  });
});

const logger: Logger = {
  log(...args: any[]) {
    console.log(...args);
  },
  debug() {
    //
  },
  error(...args: any[]) {
    console.log(...args);
  },
  warn(...args: any[]) {
    console.log(...args);
  },
  logSyntaxError() {
    //
  },
};

it('runs tests with puppeteer', function (done) {
  this.timeout(50000);

  const config: TestRunnerCoreConfig = {
    files: [],
    watch: false,
    reporters: [],
    testFramework: { path: require.resolve('@web/test-runner-mocha/dist/autorun.js') },
    rootDir: path.join(process.cwd(), '..', '..'),
    logger,
    protocol: 'http:',
    hostname: 'localhost',
    port,
    concurrency: 10,
    browserStartTimeout: 30000,
    sessionStartTimeout: 10000,
    sessionFinishTimeout: 20000,
    browsers: puppeteerLauncher(),
    server: testRunnerServer(),
  };

  const runner = new TestRunner(config, [
    'test/fixtures/test-a.test.js',
    'test/fixtures/test-b.test.js',
    'test/fixtures/test-c.test.js',
    'test/fixtures/test-d.test.js',
    'test/fixtures/test-e.test.js',
    'test/fixtures/test-f.test.js',
    'test/fixtures/test-g.test.js',
    'test/fixtures/test-h.test.js',
    'test/fixtures/test-i.test.js',
    'test/fixtures/test-j.test.js',
    'test/fixtures/test-k.test.js',
    'test/fixtures/test-l.test.js',
    'test/fixtures/test-m.test.js',
    'test/fixtures/test-n.test.js',
    'test/fixtures/test-o.test.js',
  ]);

  runner.on('finished', () => {
    runner.stop();
  });

  runner.on('stopped', () => {
    const sessions = Array.from(runner.sessions.all());
    expect(sessions.length).to.equal(15, 'there should be two test sessions');

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
