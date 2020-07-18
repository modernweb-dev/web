import selenium from 'selenium-standalone';
import path from 'path';
import { expect } from 'chai';
import { TestRunnerCoreConfig, TestRunner } from '@web/test-runner-core';
import { testRunnerServer } from '@web/test-runner-server';
import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import portfinder from 'portfinder';

import { seleniumLauncher } from '../src/seleniumLauncher';

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

let port: number;
beforeEach(async () => {
  port = await portfinder.getPortPromise({
    port: 9000 + Math.floor(Math.random() * 1000),
  });
});

before(async function () {
  this.timeout(50000);
  seleniumServer = await startSeleniumServer();
});

it('runs tests with selenium', function (done) {
  this.timeout(50000);

  const config: TestRunnerCoreConfig = {
    files: [],
    watch: false,
    testFramework: '@web/test-runner-mocha/dist/autorun.js',
    rootDir: path.join(process.cwd(), '..', '..'),
    protocol: 'http:',
    hostname: 'localhost',
    port,
    concurrency: 4,
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
    expect(sessions.length).to.equal(30, 'there should be 30 test sessions');

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

after(() => {
  seleniumServer.kill();
});
