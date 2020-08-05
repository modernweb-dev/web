---
title: Test Runner Browserstack
eleventyNavigation:
  key: Browserstack
  parent: Browser Launchers
---

Browser launcher for Web Test Runner using Browserstack.

For modern browsers we recommend using other browser launchers, as they are a lot faster. Browserstack can be used to target older browser versions.

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.

## Usage

```js
const { browserstackLauncher } = require('@web/test-runner-browserstack');

const sharedCapabilities = {
  // it's recommended to store user and key as environment variables
  'browserstack.user': process.env.BROWSER_STACK_USERNAME,
  'browserstack.key': process.env.BROWSER_STACK_ACCESS_KEY,

  project: 'my project',
  name: 'my test',
  // if you are running tests in a CI, the build id might be available as an
  // environment variable. this is useful for identifying test runs
  // this is for example the name for github actions
  build: `build ${process.env.GITHUB_RUN_NUMBER || 'unknown'}`,
};

module.exports = {
  browsers: [
    browserstackLauncher({
      capabilities: {
        ...sharedCapabilities,
        browserName: 'Chrome',
        os: 'Windows',
        os_version: '10',
      },
    }),
    browserstackLauncher({
      capabilities: {
        ...sharedCapabilities,
        browserName: 'Safari',
        browser_version: '11.1',
        os: 'OS X',
        os_version: 'High Sierra',
      },
    }),
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
};
```
