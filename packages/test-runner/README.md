# Web Test Runner

> This project is in beta. We are looking for people to test it out, and let us know about issues and what they think about it.

A test runner for web applications.

👉&nbsp;&nbsp; Headless browsers with puppeteer, playwright, or selenium.
\
🚧&nbsp;&nbsp; Reports logs, 404s, and errors from the browser.
\
📦&nbsp;&nbsp; Supports native es modules.
\
🔧&nbsp;&nbsp; Runs tests in parallel and isolation.
\
👀&nbsp;&nbsp; Interactive watch mode.
\
🏃&nbsp;&nbsp; Reruns only changed tests.
\
🚀&nbsp;&nbsp; Powered by [esbuild](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-esbuild) and [rollup plugins](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-rollup)

## Getting started

Install the test runner:

```bash
npm i -D @web/test-runner
```

Do a single test run:

```bash
web-test-runner test/**/*.test.js --node-resolve
wtr test/**/*.test.js --node-resolve
```

Run in watch mode, reloading on file changes:

```bash
web-test-runner test/**/*.test.js --node-resolve --watch
wtr test/**/*.test.js --node-resolve --watch
```

Run with test coverag (this is slower):

```bash
web-test-runner test/**/*.test.js --node-resolve --coverage
wtr test/**/*.test.js --node-resolve --coverage
```

## Example projects

Check out these example projects for a full setup.

- [lit-element](https://github.com/modernweb-dev/web/tree/master/demo/projects/lit-element)
- [lit-element typescript](https://github.com/modernweb-dev/web/tree/master/demo/projects/lit-element-ts)
- [preact htm](https://github.com/modernweb-dev/web/tree/master/demo/projects/preact-htm)
- [preact jsx](https://github.com/modernweb-dev/web/tree/master/demo/projects/preact-jsx)
- [preact tsx](https://github.com/modernweb-dev/web/tree/master/demo/projects/preact-tsx)

## Writing tests

Web test runner can support different test frameworks. By default we use [@web/test-runner-mocha](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-mocha), check out the docs to learn more about writing tests with mocha and configuring mocha options.

### JS tests

When you point the test runner to a JS file, it will hand the file to the configured test framework to load and run it.

### HTML tests

When you point the test runner at an HTML file you can take full control over the test environment. There is no automatic bootstrapping of a test framework, you need to make sure things are set up and results are communicated back to the test runner. [@web/test-runner-mocha](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-mocha) can be used as a library for HTML tests, taking care of most of the heavy lifting. You can also use the low level [@web/test-runner-browser-lib](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-browser-lib) for full control.

## Browsers

By default, tests are run with the locally installed instance of Chrome, controlled via `puppeteer-core`.

### Puppeteer

You can run tests with puppeteer, which will download its a local instance of Chromium instead of relying on a globally installed version of Chrome.

```bash
# add the package
npm i -D @web/test-runner-puppeteer

# add the flag
wtr test/**/*.test.js --node-resolve --puppeteer
```

### Playwright

You can run tests with playwright, which like puppeteer downloads it's own browsers. Playwright allows testing on chromium, firefox, and WebKit.

```bash
# add the package
npm i -D @web/test-runner-playwright

# add the flag
wtr test/**/*.test.js --node-resolve --playwright --browsers chromium firefox webkit
```

## Commands

| name              | type         | description                                                                                 |
| ----------------- | ------------ | ------------------------------------------------------------------------------------------- |
| files             | string       | test files glob. this is the default option, so you do not need to specify it.              |
| watch             | boolean      | runs in watch mode                                                                          |
| coverage          | boolean      | whether to analyze test coverage                                                            |
| node-resolve      | boolean      | resolve bare module imports                                                                 |
| preserve-symlinks | boolean      | preserve symlinks when resolving imports                                                    |
| puppeteer         | boolean      | whether to run tests with @web/test-runner-puppeteer                                        |
| playwright        | boolean      | whether to run tests with @web/test-runner-playwright                                       |
| browsers          | string array | if playwright is set, specifies which browsers to run tests on. chromium, firefox or webkit |
| config            | config       | where to read the config from                                                               |
| concurrency       | number       | amount of test files to run concurrently                                                    |

## Configuration

Web test runner looks for a configuration file in the current working directory called `web-test-runner.config`.

The file extension can be `.js`, `.cjs` or `.mjs`. A `.js` file will be loaded as an es module or common js module based on your version of node, and the package type of your project.

<details>
<summary>View example</summary>

```js
module.exports = {
  concurrency: 10,
  nodeResolve: true,
  watch: true,
  // in a monorepo you need to set set the root dir to resolve modules
  rootDir: '../../',
};
```

</details>

<details>
  <summary>Full config type definition</summary>

```ts
import { Plugin, Middleware } from '@web/dev-server';

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
  concurrency?: number;
  watch?: boolean;
  nodeResolve?: boolean;
  preserveSymlinks?: boolean;

  testFramework?: string;
  browsers?: BrowserLauncher | BrowserLauncher[];
  server?: Server;

  middleware?: Middleware[];
  plugins?: Plugin[];

  protocol?: string;
  hostname?: string;
  port?: number;

  testRunnerHtml?: (config: TestRunnerConfig) => string;

  coverage?: boolean;
  coverageConfig?: CoverageConfig;

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
module.exports = {
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

## Viewport

You can change the viewport during tests using the [@web/test-runner-helpers](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-helpers) library.

## Authoring es modules

We recommend writing tests as native es modules. Check out these [es modules](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-core/docs/es-modules.md) to learn more about authoring and using es modules.

## Server and code transformation

The test runner server is based on [@web/dev-server-core](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-core), which has a rich plugin and middleware system. It also supports reusing rollup plugins with [@web/dev-server-rollup](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-rollup).

Plugins can be installed from the configuration file, for example to use typescript:

```js
const { esbuildPlugin } = require('@web/dev-server-esbuild');

module.exports = {
  plugins: [esbuildPlugin({ ts: true })],
};
```

Check out the full documentation for more infromation and examples:

- [Common code transformations](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-core/docs/code-transformations.md)
- [Server Middleware](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-core/docs/server-middleware.md)
- [Server plugins](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-core/docs/server-plugins.md)

## Customizing test runner HTML

When running javascript tests, the test runner runs the test in a standard minimal HTML page. You can provide a custom HTML container to run the tests in with the `testRunnerHtml` function. This function receives the module import for the test runner and the test runner config.

You can use this to set up the testing environment, for example, to set global variables or load test bootstrap code.

<details>
  <summary>View example</summary>

```js
module.exports = {
  testRunnerHtml: (testRunnerImport, config) => `
    <html>
      <body>
        <script type="module">
          window.someGlobal = 'foo';
        </script>

        <script type="module">
          import '${testRunnerImport}';
        </script>
      </body>
    </html>
  `,
};
```

</details>

## Customizing browser launch options

You can customize the configuration to launch browsers by creating the browser launchers yourself instead of the CLI.

<details>
  <summary>View example</summary>

```js
// import the browser launcher you want to use
const { chromeLauncher } = require('@web/test-runner-chrome');

module.exports = {
  browsers: chromeLauncher({ launchOptions: { args: ['--no-sandbox'] } }),
};
```

</details>

Check the docs for [@web/test-runner-chrome](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-chrome), [@web/test-runner-puppeteer](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-puppeteer) and [@web/test-runner-playwright](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-playwright) for all options.

## Advanced customization

This package is the opinionated default implementation of the test runner so that people can get started without much configuration.

For more advanced configuration you can use the individual packages this project is based on. See [@web/test-runner-core](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-core) and [@web/test-runner-cli](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-core) to learn more about that.
