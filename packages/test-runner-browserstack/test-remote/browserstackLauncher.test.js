/* eslint-disable @typescript-eslint/no-var-requires */
const { runTests } = require('@web/test-runner-core/test-helpers');
const { legacyPlugin } = require('@web/dev-server-legacy');
const { resolve } = require('path');

const { browserstackLauncher } = require('../dist/browserstackLauncher');

const sharedCapabilities = {
  'browserstack.user': process.env.BROWSER_STACK_USERNAME,
  'browserstack.key': process.env.BROWSER_STACK_ACCESS_KEY,

  project: '@web/test-runner-browserstack',
  name: 'integration test',
  build: `modern-web ${process.env.GITHUB_REF ?? 'local'} build ${
    process.env.GITHUB_RUN_NUMBER ?? ''
  }`,
};

it('runs tests on browserstack', async function () {
  this.timeout(1000 * 60 * 5);

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
      // browserstackLauncher({
      //   capabilities: {
      //     ...sharedCapabilities,
      //     browserName: 'Chrome',
      //     browser_version: 'latest',
      //     os: 'windows',
      //     os_version: '10',
      //   },
      // }),
      // browserstackLauncher({
      //   capabilities: {
      //     ...sharedCapabilities,
      //     browserName: 'Safari',
      //     browser_version: '11.1',
      //     os: 'OS X',
      //     os_version: 'High Sierra',
      //   },
      // }),
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
    concurrency: 5,
    plugins: [legacyPlugin()],
    browserStartTimeout: 1000 * 60 * 1,
    testsStartTimeout: 1000 * 60 * 1,
    testsFinishTimeout: 1000 * 60 * 1,
  });
});
