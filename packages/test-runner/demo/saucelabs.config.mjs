import { createSauceLabsLauncher } from '@web/test-runner-saucelabs';
import { legacyPlugin } from '@web/dev-server-legacy';

const sauceLabsLauncher = createSauceLabsLauncher(
  {
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    region: 'eu',
  },
  undefined,
  true,
);

const sharedCapabilities = {
  'sauce:options': {
    build: `modern-web ${process.env.GITHUB_REF ?? 'local'} build ${
      process.env.GITHUB_RUN_NUMBER ?? ''
    }`,
    name: 'integration test',
  },
};

export default {
  files: 'demo/test/pass-!(commands)*.test.js',
  rootDir: '../..',
  nodeResolve: true,
  plugins: [legacyPlugin()],
  browsers: [
    sauceLabsLauncher({
      ...sharedCapabilities,
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),
    // sauceLabsLauncher({
    //   ...sharedCapabilities,
    //   browserName: 'chrome',
    //   browserVersion: 'latest-1',
    //   platformName: 'Windows 10',
    // }),
    // sauceLabsLauncher({
    //   ...sharedCapabilities,
    //   browserName: 'chrome',
    //   browserVersion: 'latest-2',
    //   platformName: 'Windows 10',
    // }),
    // // sauceLabsLauncher({
    // //   ...sharedCapabilities,
    // //   browserName: 'safari',
    // //   browserVersion: 'latest',
    // //   platformName: 'macOS 10.15',
    // // }),
    // sauceLabsLauncher({
    //   ...sharedCapabilities,
    //   browserName: 'firefox',
    //   browserVersion: 'latest',
    //   platformName: 'Windows 10',
    // }),
    // sauceLabsLauncher({
    //   ...sharedCapabilities,
    //   browserName: 'internet explorer',
    //   browserVersion: '11.0',
    //   platformName: 'Windows 7',
    // }),
  ],
  browserStartTimeout: 1000 * 60 * 1,
  testsStartTimeout: 1000 * 60 * 1,
  testsFinishTimeout: 1000 * 60 * 1,
};
