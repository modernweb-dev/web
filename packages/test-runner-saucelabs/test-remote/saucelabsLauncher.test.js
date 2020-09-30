/* eslint-disable @typescript-eslint/no-var-requires */
const { runTests } = require('@web/test-runner-core/test-helpers');
const { legacyPlugin } = require('@web/dev-server-legacy');
const { resolve } = require('path');

const { createSauceLabsLauncher } = require('../dist/index');

const sauceLabsLauncher = createSauceLabsLauncher({
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  region: 'eu',
});

const sharedCapabilities = {
  'sauce:options': {
    build: `modern-web ${process.env.GITHUB_REF ?? 'local'} build ${
      process.env.GITHUB_RUN_NUMBER ?? ''
    }`,
    name: 'integration test',
  },
};

it('runs tests on saucelabs', async function () {
  this.timeout(1000 * 60 * 5);

  const runner = await runTests({
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
      resolve(__dirname, 'fixtures', 'stage-4-features.js'),
      resolve(__dirname, 'fixtures', 'module-features.js'),
    ],
    browsers: [
      sauceLabsLauncher({
        ...sharedCapabilities,
        browserName: 'chrome',
        browserVersion: 'latest',
        platformName: 'Windows 10',
      }),
      sauceLabsLauncher({
        ...sharedCapabilities,
        browserName: 'firefox',
        browserVersion: 'latest',
        platformName: 'Windows 10',
      }),
      // sauceLabsLauncher({
      //   ...sharedCapabilities,
      //   browserName: 'safari',
      //   browserVersion: 'latest',
      //   platformName: 'macOS 10.15',
      // }),
      sauceLabsLauncher({
        ...sharedCapabilities,
        browserName: 'internet explorer',
        browserVersion: '11.0',
        platformName: 'Windows 7',
      }),
    ],
    concurrentBrowsers: 2,
    concurrency: 6,
    plugins: [legacyPlugin()],
    browserStartTimeout: 1000 * 60 * 2,
    testsStartTimeout: 1000 * 60 * 2,
    testsFinishTimeout: 1000 * 60 * 2,
  });

  runner.sessions.all();
});
