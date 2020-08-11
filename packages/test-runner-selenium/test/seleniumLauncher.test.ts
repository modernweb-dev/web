import { runTests } from '@web/test-runner-core/test-helpers';
import selenium from 'selenium-standalone';
import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import { resolve } from 'path';

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

before(async function () {
  this.timeout(50000);
  seleniumServer = await startSeleniumServer();
});

it('runs tests with playwright', async function () {
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
      resolve(__dirname, 'fixtures', 'a.js'),
      resolve(__dirname, 'fixtures', 'b.js'),
      resolve(__dirname, 'fixtures', 'c.js'),
      resolve(__dirname, 'fixtures', 'd.js'),
      resolve(__dirname, 'fixtures', 'e.js'),
      resolve(__dirname, 'fixtures', 'f.js'),
      resolve(__dirname, 'fixtures', 'g.js'),
    ],
  );
});

after(() => {
  seleniumServer.kill();
});
