import path from 'path';
import { expect } from 'chai';
import { TestRunnerCoreConfig, TestRunner } from '@web/test-runner-core';
import { testRunnerServer } from '@web/test-runner-server';
import { chromeLauncher } from '../src/chromeLauncher';

it('runs tests with chrome', function (done) {
  this.timeout(50000);

  const config: TestRunnerCoreConfig = {
    files: [],
    watch: false,
    testFramework: '@web/test-runner-mocha/dist/autorun.js',
    rootDir: path.join(process.cwd(), '..', '..'),
    protocol: 'http:',
    hostname: 'localhost',
    port: 9542,
    concurrency: 10,
    browserStartTimeout: 30000,
    sessionStartTimeout: 10000,
    sessionFinishTimeout: 20000,
    browsers: chromeLauncher(),
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

  runner.on('quit', () => {
    const sessions = Array.from(runner.sessions.all());
    expect(sessions.length).to.equal(15, 'there should be 15 test sessions');

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
