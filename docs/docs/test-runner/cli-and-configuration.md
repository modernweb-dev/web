---
title: CLI and Configuration
eleventyNavigation:
  key: CLI and Configuration
  parent: Test Runner
  order: 2
---

The test runner can be configured using CLI flags, or with a configuration file.

## CLI flags

| name              | type         | description                                                                                 |
| ----------------- | ------------ | ------------------------------------------------------------------------------------------- |
| files             | string       | test files glob. this is the default option, so you do not need to specify it.              |
| watch             | boolean      | runs in watch mode                                                                          |
| coverage          | boolean      | whether to analyze code coverage                                                            |
| node-resolve      | boolean      | resolve bare module imports                                                                 |
| preserve-symlinks | boolean      | preserve symlinks when resolving imports                                                    |
| puppeteer         | boolean      | whether to run tests with @web/test-runner-puppeteer                                        |
| playwright        | boolean      | whether to run tests with @web/test-runner-playwright                                       |
| browsers          | string array | if playwright is set, specifies which browsers to run tests on. chromium, firefox or webkit |
| config            | object       | where to read the config from                                                               |
| concurrency       | number       | amount of test files to run concurrently                                                    |

Examples:

```
web-test-runner test/**/*.test.js --node-resolve
web-test-runner test/**/*.test.js --node-resolve --watch
web-test-runner test/**/*.test.js --node-resolve --coverage
web-test-runner test/**/*.test.js --node-resolve --playwright --browsers chromium firefox webkit
```

You can also use the shorthand `wtr` command:

```
wtr test/**/*.test.js --node-resolve
```

## Configuration file

Web test runner looks for a configuration file in the current working directory called `web-test-runner.config`.

The file extension can be `.js`, `.cjs` or `.mjs`. A `.js` file will be loaded as an es module or common js module based on your version of node, and the package type of your project.

We recommend writing the configuration using [node js es module](https://nodejs.org/api/esm.html) syntax, and using the `.mjs` just to make sure your config is always loaded correctly. All the examples in our documentation use es module syntax, but the config can be written as common js as well.

<details>
<summary>View examples</summary>

A config written as es module:

```js
export default {
  concurrency: 10,
  nodeResolve: true,
  watch: true,
  // in a monorepo you need to set set the root dir to resolve modules
  rootDir: '../../',
};
```

A config written as a commonjs module:

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

A configuration file accepts most of the command line args camel cased, with some extra options. Check the type definition for all options:

<details>
  <summary>Full config type definition</summary>

```ts
import { Plugin, Middleware } from '@web/dev-server';

interface TestFramework {
  path: string;
  config?: unknown;
}

interface CoverageThresholdConfig {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

interface CoverageConfig {
  include?: string[];
  exclude?: string[];
  threshold?: CoverageThresholdConfig;
  report: boolean;
  reportDir: string;
}

type MimeTypeMappings = Record<string, string>;

interface TestRunnerConfig {
  // globs of files to test
  files: string | string[];
  // amount of test files to run in parallel
  concurrency?: number;
  // run in watch mode, reloading when files change
  watch?: boolean;
  // resolve bare imports imports
  nodeResolve?: boolean;
  // preserve symlinks when resolve imports, instead of following
  // symlinks to their original files
  preserveSymlinks?: boolean;
  // the root directory to serve files from. this is useful in a monorepo
  // when executing commands from a package
  rootDir?: string;

  // the test framework to run tests in the browser
  testFramework?: TestFramework;
  // browsers to run tests in
  browsers?: BrowserLauncher | BrowserLauncher[];
  // server which serves files and responds to browser requests
  server?: Server;
  // reporters for posting results and progress to the terminal and/or file system
  reporters?: Reporter[];

  // files to serve with a different mime type
  mimeTypes?: MimeTypeMappings;
  // middleware used by the server to modify requests/responses, for example to proxy
  // requests or rewrite urls
  middleware?: Middleware[];
  // plugins used by the server to serve or transform files
  plugins?: Plugin[];

  // configuration for the server
  protocol?: string;
  hostname?: string;
  port?: number;

  // html page used to run tests
  testRunnerHtml?: (testRunnerImport: string, config: TestRunnerCoreConfig) => string;

  // run code coverage
  coverage?: boolean;
  // configuration for code coverage
  coverageConfig?: CoverageConfig;

  // how long a browser can take to start up before failing. defaults to 30000
  browserStartTimeout?: number;
  // how long a test file can take to load. defaults to 10000
  sessionStartTimeout?: number;
  // how long a test file can take to finish. defaults to 20000
  sessionFinishTimeout?: number;
}
```

</details>

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
