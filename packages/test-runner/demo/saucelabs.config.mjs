import { createSauceLabsLauncher } from '@web/test-runner-saucelabs';
import { legacyPlugin } from '@web/dev-server-legacy';

const sauceLabsCapabilities = {
  build: `modern-web ${process.env.GITHUB_REF || 'local'} build ${
    process.env.GITHUB_RUN_NUMBER || ''
  }`,
  name: 'integration test',
};

const sauceLabsLauncher = createSauceLabsLauncher(
  {
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    region: 'eu',
  },
  sauceLabsCapabilities,
);

export default {
  files: 'demo/test/pass-!(commands)*.test.js',
  rootDir: '../..',
  nodeResolve: true,
  plugins: [legacyPlugin()],
  browsers: [
    sauceLabsLauncher({
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),
    // sauceLabsLauncher({
    //   browserName: 'chrome',
    //   browserVersion: 'latest-1',
    //   platformName: 'Windows 10',
    // }),
    // sauceLabsLauncher({
    //   browserName: 'chrome',
    //   browserVersion: 'latest-2',
    //   platformName: 'Windows 10',
    // }),
    // // sauceLabsLauncher({
    // //   browserName: 'safari',
    // //   browserVersion: 'latest',
    // //   platformName: 'macOS 10.15',
    // // }),
    // sauceLabsLauncher({
    //   browserName: 'firefox',
    //   browserVersion: 'latest',
    //   platformName: 'Windows 10',
    // }),
    // sauceLabsLauncher({
    //   browserName: 'internet explorer',
    //   browserVersion: '11.0',
    //   platformName: 'Windows 7',
    // }),
  ],
  browserStartTimeout: 1000 * 60 * 1,
  testsStartTimeout: 1000 * 60 * 1,
  testsFinishTimeout: 1000 * 60 * 1,
};
