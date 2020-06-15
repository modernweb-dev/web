import path from 'path';
import { expect } from 'chai';
import { TestRunnerConfig, TestRunner } from '@web/test-runner-core';
import { testRunnerServer } from '@web/test-runner-server';
import { playwrightLauncher, BrowserType } from '../src/playwrightLauncher';

it('runs tests with playwright', function(done) {
  this.timeout(50000);
  const browserTypes = ['chromium', 'firefox', 'webkit'] as BrowserType[];
  const testFiles = ['test/fixtures/test-a.test.js', 'test/fixtures/test-b.test.js'];

  const config: TestRunnerConfig = {
    files: [],
    watch: false,
    testFrameworkImport: '@web/test-runner-mocha/autorun.js',
    rootDir: path.join(process.cwd(), '..', '..'),
    address: 'http://localhost',
    port: 9542,
    concurrency: 10,
    browserStartTimeout: 30000,
    sessionStartTimeout: 10000,
    sessionFinishTimeout: 20000,
    browsers: playwrightLauncher({ browserTypes }),
    server: testRunnerServer({ rootDir: path.join(process.cwd(), '..', '..') }),
  };

  const runner = new TestRunner(config, testFiles);

  runner.on('quit', () => {
    const sessions = Array.from(runner.sessions.all());
    expect(sessions.length).to.equal(6, 'there should be six test sessions');

    for (const browserType of browserTypes) {
      for (const testFile of testFiles) {
        const session = sessions.find(
          s => s.browserName.toLowerCase() === browserType && s.testFile === testFile,
        );

        if (!session) {
          throw new Error(`Should have a session for browser ${browserType} and file ${testFile}`);
        }
      }
    }
    done();
  });

  runner.start();
});
