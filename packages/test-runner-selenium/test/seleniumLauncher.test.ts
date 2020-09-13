import { runTests } from '@web/test-runner-core/test-helpers';
import selenium from 'selenium-standalone';
import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import { resolve } from 'path';
import os from 'os';

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

// selenium doesn't work on windows in the CI
(os.platform() === 'win32' ? it.skip : it)('runs tests with selenium', async function () {
  this.timeout(50000);

  await runTests({
    files: [
      resolve(__dirname, 'fixtures', 'a.js'),
      resolve(__dirname, 'fixtures', 'b.js'),
      resolve(__dirname, 'fixtures', 'c.js'),
      resolve(__dirname, 'fixtures', 'd.js'),
      resolve(__dirname, 'fixtures', 'e.js'),
      resolve(__dirname, 'fixtures', 'f.js'),
      resolve(__dirname, 'fixtures', 'g.js'),
      resolve(__dirname, 'fixtures', 'h.js'),
      resolve(__dirname, 'fixtures', 'i.js'),
      resolve(__dirname, 'fixtures', 'j.js'),
      resolve(__dirname, 'fixtures', 'module-features.js'),
      resolve(__dirname, 'fixtures', 'stage-4-features.js'),
    ],
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
    concurrency: 5,
  });
});

after(() => {
  seleniumServer.kill();
});
