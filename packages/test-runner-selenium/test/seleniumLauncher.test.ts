import { runTests } from '@web/test-runner-core/dist/test-helpers';
import selenium from 'selenium-standalone';
import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';

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

before(async function() {
  this.timeout(50000);
  seleniumServer = await startSeleniumServer();
});

it('runs tests with playwright', async function() {
  this.timeout(50000);

  await runTests(
    {
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
      concurrency: 3,
    },
    [
      'test/fixtures/test-a.test.js',
      'test/fixtures/test-b.test.js',
      'test/fixtures/test-c.test.js',
      'test/fixtures/test-d.test.js',
      'test/fixtures/test-e.test.js',
      'test/fixtures/test-f.test.js',
      'test/fixtures/test-g.test.js',
    ],
  );
});

after(() => {
  seleniumServer.kill();
});
