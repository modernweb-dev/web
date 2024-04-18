# Test Runner >> Browser Launchers >> Browserstack ||60

Browser launchers for web test runner to run tests remotely on [Browserstack](https://www.browserstack.com/).

For modern browsers, we recommend using other browser launchers, as they are a lot faster. Browserstack is a good option for testing on older browser versions.

## Usage

Install the package:

```
npm i --save-dev @web/test-runner-browserstack
```

Add the browser launcher to your `web-test-runner.config.mjs`:

```js
import { browserstackLauncher } from '@web/test-runner-browserstack';

// options shared between all browsers
const sharedCapabilities = {
  // your username and key for browserstack, you can get this from your browserstack account
  // it's recommended to store these as environment variables
  'browserstack.user': process.env.BROWSER_STACK_USERNAME,
  'browserstack.key': process.env.BROWSER_STACK_ACCESS_KEY,

  project: 'my project',
  name: 'my test',
  // if you are running tests in a CI, the build id might be available as an
  // environment variable. this is useful for identifying test runs
  // this is for example the name for github actions
  build: `build ${process.env.GITHUB_RUN_NUMBER || 'unknown'}`,
};

export default {
  // how many browsers to run concurrently in browserstack. increasing this significantly
  // reduces testing time, but your subscription might limit concurrent connections
  concurrentBrowsers: 2,
  // amount of test files to execute concurrently in a browser. the default value is based
  // on amount of available CPUs locally which is irrelevant when testing remotely
  concurrency: 6,
  browsers: [
    // create a browser launcher per browser you want to test
    // you can get the browser capabilities from the browserstack website
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

## Configuration

The Browserstack launcher takes two properties, `capabilities` and `localOptions`.

`capabilities` are the selenium capabilities used to configure the browser to launch in Browserstack. You can generate most of these on the Saucelabs. It must contain a `browserstack.user` and `browserstack.key` property to authenticate with Browserstack, as well as `name`, `build` and `project` to identify the test run.

`localOptions` are options to configure the [browserstack-local](https://www.npmjs.com/package/browserstack-local) proxy. For most use cases, you don't need to configure this property.
