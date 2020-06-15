import selenium from 'selenium-standalone';
import path from 'path';
import { expect } from 'chai';
import { TestRunnerConfig, TestRunner } from '@web/test-runner-core';
import { testRunnerServer } from '@web/test-runner-server';
import { seleniumLauncher } from '../src/seleniumLauncher';
import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';

async function startSeleniumServer() {
  await new Promise((resolve, reject) =>
    selenium.install(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    }),
  );

  return new Promise<selenium.ChildProcess>((resolve, reject) =>
    selenium.start((err, server) => {
      if (err) {
        reject(err);
      } else {
        resolve(server);
      }
    }),
  );
}

let seleniumServer: selenium.ChildProcess;

before(async function() {
  this.timeout(50000);
  seleniumServer = await startSeleniumServer();
});

it('runs tests with selenium', function(done) {
  this.timeout(50000);

  const config: TestRunnerConfig = {
    files: [],
    watch: false,
    testFrameworkImport: '@web/test-runner-mocha/autorun.js',
    rootDir: path.join(process.cwd(), '..', '..'),
    address: 'http://localhost',
    port: 9542,
    concurrency: 2,
    browserStartTimeout: 30000,
    sessionStartTimeout: 10000,
    sessionFinishTimeout: 20000,
    browsers: [
      seleniumLauncher({
        driverBuilder: new Builder()
          .forBrowser('chrome')
          .setChromeOptions(new ChromeOptions().headless())
          .usingServer('http://localhost:4444/wd/hub'),
      }),
      seleniumLauncher({
        driverBuilder: new Builder()
          .forBrowser('firefox')
          .setFirefoxOptions(new FirefoxOptions().headless())
          .usingServer('http://localhost:4444/wd/hub'),
      }),
    ],
    server: testRunnerServer(),
  };

  const runner = new TestRunner(config, [
    'test/fixtures/test-a.test.js',
    'test/fixtures/test-b.test.js',
    'test/fixtures/test-c.test.js',
    'test/fixtures/test-d.test.js',
    'test/fixtures/test-e.test.js',
  ]);

  runner.on('quit', () => {
    const sessions = Array.from(runner.sessions.all());
    expect(sessions.length).to.equal(10, 'there should be two test sessions');

    for (const session of sessions) {
      if (!session.passed) {
        throw session.error;
      }
    }

    done();
  });

  runner.start();
});

after(() => {
  seleniumServer.kill();
});
