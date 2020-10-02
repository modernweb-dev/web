# Test Runner >> CLI and Configuration ||2

The test runner can be configured using CLI flags, or with a configuration file.

## CLI flags

| name                | type         | description                                                                                                           |
| ------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| files               | string       | test files glob. this is the default option, so you do not need to specify it.                                        |
| watch               | boolean      | runs in watch mode                                                                                                    |
| coverage            | boolean      | whether to analyze code coverage                                                                                      |
| node-resolve        | boolean      | resolve bare module imports                                                                                           |
| esbuild-target      | string array | JS language target to compile down to using esbuild. Recommended value is "auto", which compiles based on user-agent. |
| preserve-symlinks   | boolean      | preserve symlinks when resolving imports                                                                              |
| puppeteer           | boolean      | whether to run tests with @web/test-runner-puppeteer                                                                  |
| playwright          | boolean      | whether to run tests with @web/test-runner-playwright                                                                 |
| browsers            | string array | if playwright is set, specifies which browsers to run tests on. chromium, firefox or webkit                           |
| config              | object       | where to read the config from                                                                                         |
| groups              | string       | pattern of where to read test group config files from                                                                 |
| group               | string       | runs tests only for the test group with this name                                                                     |
| concurrent-browsers | number       | amount of browsers to run concurrently. defaults to 2                                                                 |
| concurrency         | number       | amount of test files to run concurrently. default to CPU cores divided by 2                                           |

Examples:

```
web-test-runner test/**/*.test.js --node-resolve
web-test-runner test/**/*.test.js --node-resolve --watch
web-test-runner test/**/*.test.js --node-resolve --coverage
web-test-runner test/**/*.test.js --node-resolve --playwright --browsers chromium firefox webkit
web-test-runner test/**/*.test.js --node-resolve --esbuild-target auto
```

You can also use the shorthand `wtr` command:

```
wtr test/**/*.test.js --node-resolve --esbuild-target auto
```

## esbuild target

The `--esbuild-target` flag uses the [@web/dev-server-esbuild plugin](https://modern-web.dev/docs/dev-server/plugins/esbuild/) to compile JS to a compatible language version. Depending on what language features you are using and the browsers you are testing on, you may not need this flag.

If you need this flag, we recommend setting this to `auto`. This will compile based on user-agent, and skip work on modern browsers. [Check the docs](https://modern-web.dev/docs/dev-server/plugins/esbuild/) for all other possible options.

## Configuration file

Web test runner looks for a configuration file in the current working directory called `web-test-runner.config`.

The file extension can be `.js`, `.cjs` or `.mjs`. A `.js` file will be loaded as an es module or common js module based on your version of node, and the package type of your project.

We recommend writing the configuration using [node js es module](https://nodejs.org/api/esm.html) syntax and using the `.mjs` file extension to make sure your config is always loaded correctly. All the examples in our documentation use es module syntax.

A config written as es module `web-test-runner.config.mjs`:

```js
export default {
  concurrency: 10,
  nodeResolve: true,
  watch: true,
  // in a monorepo you need to set set the root dir to resolve modules
  rootDir: '../../',
};
```

A config written as commonjs `web-test-runner.config.js`:

```js
module.exports = {
  concurrency: 10,
  nodeResolve: true,
  watch: true,
  // in a monorepo you need to set set the root dir to resolve modules
  rootDir: '../../',
};
```

A configuration file accepts most of the command line args camel-cased, with some extra options. These are the full type definitions:

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

interface TestRunnerGroupConfig {
  // the name of the test group, this is used for reporting and to run only
  // a specific group using the --group flag
  name: string;
  // globs of files to test in this group, if unset it will be inherited from the main config
  files?: string | string[];
  // browsers to test in this group, if unset it will be inherited from the main config
  browsers?: BrowserLauncher[];
}

interface TestRunnerConfig {
  // globs of files to test
  files: string | string[];
  // test group configs, can be an array of configs or a string or string array of glob patterns
  // which specify where to find the configs
  groups?: string | string[] | TestRunnerGroupConfig[];
  // amount of browsers to run in parallel
  concurrentBrowsers?: number;
  // amount of test files to run in parallel
  concurrency?: number;
  // run in watch mode, reloading when files change
  watch?: boolean;
  // resolve bare module imports
  nodeResolve?: boolean | RollupNodeResolveOptions;
  // preserve symlinks when resolving bare module imports
  preserveSymlinks?: boolean;
  // JS language target to compile down to using esbuild. Recommended value is "auto", which compiles based on user agent.
  esbuildTarget?: string | string[];
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

  // whether to track browser logs and print them in the node terminal
  // defaults to true
  browserLogs?: boolean;
  // function filter browser logs, receives the log type such as 'info', 'warn' or 'error'
  // and the arguments passed to the console log function return true to include and false to exclude
  filterBrowserLogs?: (log: { type: string; args: any[] }) => boolean;
  // run code coverage
  coverage?: boolean;
  // configuration for code coverage
  coverageConfig?: CoverageConfig;

  /** Starts test runner in manual testing mode. Ignores browsers option and prints manual testing URL. */
  manual?: boolean;
  /** Opens browser for manual testing. Requires the manual option to be set. */
  open?: boolean;

  // how long a browser can take to start up before failing. defaults to 30000
  browserStartTimeout?: number;
  // how long a test file can take to load. defaults to 10000
  testsStartTimeout?: number;
  // how long a test file can take to finish. defaults to 20000
  testsFinishTimeout?: number;
}
```

## Test groups

### In the main config

It's possible to create groups of tests with different configurations. A group can be created directly in the main config:

```js
export default {
  files: 'test/**/*.test.js',
  groups: [
    {
      name: 'package-a',
      files: 'packages/a/test/**/*.test.js',
    },
    {
      name: 'package-a',
      files: 'packages/b/test/**/*.test.js',
    },
  ],
};
```

A group will inherit all options from the parent config unless they are overwritten. Not all options can be overwritten, see the config types which options are available.

When running tests regularly, the tests from regular config and the groups will be run. You can run only the tests of a test group by using the `--group` flag. For example `web-test-runner --group package-a`.

### Using separate file

Test groups can also be created in separate files using a glob pattern:

Using the CLI:

`wtr --groups "test/**/*.config.mjs"`

Using a config:

```js
export default {
  groups: 'test/**/*.config.mjs',
};
```

This test group config should have a default export with the configuration for that group.

## Examples

### Run only some tests on a specific browser

```js
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  groups: [
    {
      name: 'chromium-webkit',
      files: 'test/all/**/*.test.js',
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
    },
    {
      name: 'firefox-only',
      files: 'test/firefox-only/**/*.test.js',
      browsers: [playwrightLauncher({ product: 'firefox' })],
    },
  ],
};
```

### Group per package

Group tests by package, so that you can easily run tests only for a single package using the `--group` flag.

```js
import fs from 'fs';

const packages = fs
  .readdirSync('packages')
  .filter(dir => fs.statSync(`packages/${dir}`).isDirectory());

export default {
  groups: packages.map(pkg => ({
    name: pkg,
    files: `packages/${pkg}/test/**/*.test.js`,
  })),
};
```
