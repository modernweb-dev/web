# Web Test Runner

> This project is in beta. We are looking for people to test it out, and let us know about issues and what they think about it.

A test runner for web applications.

👉&nbsp;&nbsp; Headless browsers with puppeteer, playwright, or selenium.
\
🚧&nbsp;&nbsp; Reports logs, 404s, and errors from the browser.
\
📦&nbsp;&nbsp; Supports native es modules.
\
🔧&nbsp;&nbsp; Runs tests in parallel and in isolation.
\
👀&nbsp;&nbsp; Interactive watch mode.
\
🏃&nbsp;&nbsp; Reruns only changed tests.

## Getting started

Install the test runner:

```bash
npm i -D @web/test-runner
```

Do a single test run:

```bash
wtr test/**/*.test.js
```

Run in watch mode, reloading on file changes:

```bash
wtr test/**/*.test.js --watch
```

Run with test coverage:

```bash
wtr test/**/*.test.js --coverage
```

### Writing tests

Web test runner can support different test frameworks. By default we use [@web/test-runner-mocha](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-mocha), check out the docs to learn more about authoring tests.

### Browsers

By default tests are run with the locally installed instance of Chrome.

#### Puppeteer

You can run tests with puppeteer, which will download it's own instance of Chromium instead of relying on a globally installed version of Chrome.

```bash
# add the package
npm i -D @web/test-runner-puppeteer

# add the flag
wtr test/**/*.test.js --puppeteer
```

#### Playwright

You can run tests with playwright, which like puppeteer downloads it's own browsers. Playwright allows testing on chromium, firefox and webkit.

```bash
# add the package
npm i -D @web/test-runner-playwright

# add the flag
wtr test/**/*.test.js --playwright --browsers chromium firefox webkit
```

## Commands

| name        | type         | description                                                                                 |
| ----------- | ------------ | ------------------------------------------------------------------------------------------- |
| files       | string       | test files glob. this is the default option, so you do not need to specify it.              |
| watch       | boolean      | runs in watch mode                                                                          |
| coverage    | boolean      | whether to analyze test coverage                                                            |
| puppeteer   | boolean      | whether to run tests with @web/test-runner-puppeteer                                        |
| playwright  | boolean      | whether to run tests with @web/test-runner-playwright                                       |
| browsers    | string array | if playwright is set, specifies which browsers to run tests on. chromium, firefox or webkit |
| config      | config       | where to read the config from                                                               |
| concurrency | number       | amount of test files to run concurrently                                                    |
| config      | config       | where to read the config from                                                               |

## Configuration

Web test runner looks for a configuration file in the current working directory called `web-test-runner.config`.

The file extension can be `.js`, `.cjs` or `.mjs`. A `.js` file will be loaded as an es module or common js module based on your version of node, and the package type of your project.

<details>
<summary>View example</summary>

```js
export default {
  concurrency: 10,
  watch: true,
  devServer: {
    rootDir: '../../',
  },
};
```

</details>

<details>
  <summary>Full config type definition</summary>

```ts
export interface CoverageThresholdConfig {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface CoverageConfig {
  include?: string[];
  exclude?: string[];
  threshold?: CoverageThresholdConfig;
  report: boolean;
  reportDir: string;
}

export interface TestRunnerConfig {
  files: string | string[];
  testFrameworkImport: string;
  browsers: BrowserLauncher | BrowserLauncher[];
  server: Server;
  devServer: EsDevServerConfig;
  address: string;
  port: number;
  testRunnerHtml?: (config: TestRunnerConfig) => string;
  watch?: boolean;
  coverage?: boolean;
  coverageConfig?: CoverageConfig;
  concurrency?: number;
  browserStartTimeout?: number;
  sessionStartTimeout?: number;
  sessionFinishTimeout?: number;
  staticLogging?: boolean;
}
```

</details>

## Test coverage

You can run tests with test coverage using the `--coverage` flag:

```bash
wtr test/**/*.test.js --coverage
```

In the config you can define test coverage thresholds, the test run fails if you drop below this level. You can also configure where and if the detailed test report is written to disk.

<details>
<summary>View example</summary>

```js
export default {
  coverageConfig: {
    report: true,
    reportDir: 'test-coverage',
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
```

</details>

## Server and code transformation

This package uses [@web/test-runner-server](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-server). You can configure the dev server from the config:

<details>
  <summary>View example</summary>

```js
export default {
  devServer: {
    rootDir: '../..',
    middlewares: [],
    plugins: [],
  },
};
```

</details>

es-dev-server has an extensive configuration and plugin system, check out the docs for all options.

## Advanced customization

This package is the opinionated default implementation of the test runner, so that people can get started without much configuration.

For more advanced configuration you can use the individual packages this project is based on. See [@web/test-runner-core](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-core) and [@web/test-runner-cli](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-core) to learn more about that.
