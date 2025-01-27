# Test Runner >> Browser Launchers >> Sauce Labs ||70

Browser launchers for web test runner to run tests remotely on [Sauce Labs](https://saucelabs.com/).

For modern browsers, we recommend using other browser launchers, as they are a lot faster. Sauce Labs is a good option for testing on older browser versions.

## Usage

Install the package:

```
npm i --save-dev @web/test-runner-saucelabs
```

Add the browser launcher to your `web-test-runner.config.mjs`. To set up a local proxy to sauce labs, you first need to create the browser launcher which will share a common connection between all browsers:

```js
import { createSauceLabsLauncher } from '@web/test-runner-saucelabs';

const sauceLabsCapabilities = {
  name: 'my test name',
  // if you are running tests in a CI, the build id might be available as an
  // environment variable. this is useful for identifying test runs
  // this is for example the name for github actions
  build: `my project ${process.env.GITHUB_REF ?? 'local'} build ${
    process.env.GITHUB_RUN_NUMBER ?? ''
  }`,
};

// configure the local Sauce Labs proxy, use the returned function to define the
// browsers to test
const sauceLabsLauncher = createSauceLabsLauncher(
  {
    // your username and key for Sauce Labs, you can get this from your Sauce Labs account
    // it's recommended to store these as environment variables
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    // the Sauce Labs datacenter to run your tests on, defaults to 'us-west-1'
    // region: 'eu-central-1',
  },
  sauceLabsCapabilities,
);

export default {
  // how many browsers to run concurrently in Sauce Labs. increasing this significantly
  // reduces testing time, but your subscription might limit concurrent connections
  concurrentBrowsers: 2,
  // amount of test files to execute concurrently in a browser. the default value is based
  // on amount of available CPUs locally which is irrelevant when testing remotely
  concurrency: 6,
  browsers: [
    // create a browser launcher per browser you want to test
    // you can get the browser capabilities from the Sauce Labs website
    sauceLabsLauncher({
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),

    sauceLabsLauncher({
      browserName: 'safari',
      browserVersion: '11.1',
      platformName: 'macOS 10.13',
    }),

    sauceLabsLauncher({
      browserName: 'internet explorer',
      browserVersion: '11.0',
      platformName: 'Windows 7',
    }),
  ],
};
```

## Configuration

### Setup

The `createSauceLabsLauncher` takes three properties: `sauceLabsOptions`, `sauceLabsCapabilities` and `sauceConnectOptions`. These correspond to the configuration of the [Sauce Labs library](https://www.npmjs.com/package/saucelabs).

`sauceLabsOptions` are options to instantiate the sauce labs library. The `user` and `key` properties are required for the browser launchers to work. Another common option to set is the `region` property.

`sauceLabsCapabilities` are [options](<https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-GeneralOptions(SeleniumandAppium)>) to annotate your tests, enable and disable Sauce Labs test features etc.

`sauceConnectOptions` are options to set up the sauce connect local proxy. You probably don't need to change this.

```js
const sauceLabsOptions = {
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  // region: 'eu-central-1',
};

const sauceLabsCapabilities = {
  name: 'my test name',
  build: `my project ${process.env.GITHUB_REF ?? 'local'} build ${
    process.env.GITHUB_RUN_NUMBER ?? ''
  }`,
  recordScreenshots: false,
  recordVideo: false,
};

const sauceConnectOptions = {
  // logger: msg => console.log(msg),
};

const sauceLabsLauncher = createSauceLabsLauncher(
  sauceLabsOptions,
  sauceLabsCapabilities,
  sauceConnectOptions,
);
```

### Webdriver Capabilities

`capabilities` are the webdriver capabilities used to configure the browser to launch in [Sauce Labs](https://webdriver.io/docs/api/saucelabs.html). You can generate most of these on the Sauce Labs website.

It is possible to override the Sauce Labs capabilities using a `sauce:options` property. This must contain the `name` and `build` properties to identify the test runs.
Note, the following only works for browser supporting W3C Webdriver protocol, but not the legacy JSON Wire Protocol.

```js
export default {
  browsers: [
    sauceLabsLauncher({
      'sauce:options': {
        name: 'my test name',
        build: `my project ${process.env.GITHUB_REF ?? 'local'} build ${
          process.env.GITHUB_RUN_NUMBER ?? ''
        }`,
      },
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),
  ],
};
```
