# @web/test-runner-playwright

## 0.11.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/test-runner-coverage-v8@0.8.0
  - @web/test-runner-core@0.13.0

## 0.10.3

### Patch Changes

- Updated dependencies [43be7391]
  - @web/test-runner-core@0.12.0
  - @web/test-runner-coverage-v8@0.7.3

## 0.10.2

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/test-runner-coverage-v8@0.7.2
  - @web/test-runner-core@0.11.6

## 0.10.1

### Patch Changes

- Updated dependencies [3c33d74a]
  - @web/test-runner-coverage-v8@0.7.0

## 0.10.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.

### Patch Changes

- Updated dependencies [ca715faf]
- Updated dependencies [febd9d9d]
  - @web/test-runner-coverage-v8@0.6.0
  - @web/test-runner-core@0.11.0

## 0.9.0

### Minor Changes

- acca5d51: Update dependency v8-to-istanbul to v9

### Patch Changes

- Updated dependencies [acca5d51]
  - @web/test-runner-coverage-v8@0.5.0

## 0.8.10

### Patch Changes

- 07e87287: Fixes playwright memory leak

## 0.8.9

### Patch Changes

- 8e3bb3cf: Add "forcedColors" support to "emulateMedia" command

## 0.8.8

### Patch Changes

- 62369e4d: Upgrade playwright to 1.14.0 which enables prefers-reduced-motion

## 0.8.7

### Patch Changes

- 33ada3d8: Align @web/test-runner-core version
- Updated dependencies [33ada3d8]
  - @web/test-runner-coverage-v8@0.4.8

## 0.8.6

### Patch Changes

- fdca82b2: fix error retreiving coverage in latest playwright

## 0.8.5

### Patch Changes

- a6a018da: fix type references

## 0.8.4

### Patch Changes

- 4a609a18: skip non-http coverage files
- Updated dependencies [4a609a18]
  - @web/test-runner-coverage-v8@0.4.5

## 0.8.3

### Patch Changes

- 9ecb49f4: release test coverage package
- Updated dependencies [9ecb49f4]
  - @web/test-runner-coverage-v8@0.4.3

## 0.8.2

### Patch Changes

- 83e0757e: handle cases when userAgent is not defined
- Updated dependencies [83e0757e]
  - @web/test-runner-core@0.10.8

## 0.8.1

### Patch Changes

- ad815710: fetch source map from server when generating code coverage reports. this fixes errors when using build tools that generate source maps on the fly, which don't exist on the file system
- Updated dependencies [ad815710]
- Updated dependencies [c4738a40]
  - @web/test-runner-core@0.10.5
  - @web/test-runner-coverage-v8@0.4.2

## 0.8.0

### Minor Changes

- a7d74fdc: drop support for node v10 and v11
- 1dd7cd0e: version bump after breaking change in @web/test-runner-core

### Patch Changes

- Updated dependencies [1dd7cd0e]
- Updated dependencies [a7d74fdc]
- Updated dependencies [1dd7cd0e]
  - @web/test-runner-core@0.10.0
  - @web/test-runner-coverage-v8@0.4.0

## 0.7.2

### Patch Changes

- cbbeae3f: allow configuring puppeteer and playwright browser context

## 0.7.1

### Patch Changes

- 69b2d13d: use about:blank to kill stale browser pages, this makes tests that rely on browser focus work with puppeteer

## 0.7.0

### Minor Changes

- 6e313c18: merged @web/test-runner-cli package into @web/test-runner

### Patch Changes

- Updated dependencies [6e313c18]
- Updated dependencies [0f613e0e]
  - @web/test-runner-core@0.9.0
  - @web/test-runner-coverage-v8@0.3.0

## 0.6.6

### Patch Changes

- 2278a95: bump dependencies
- Updated dependencies [0614acf]
- Updated dependencies [2278a95]
  - @web/test-runner-coverage-v8@0.2.3
  - @web/test-runner-core@0.8.11

## 0.6.5

### Patch Changes

- 72b6bd0: update to playwright 1.6.x

## 0.6.4

### Patch Changes

- 416c0d2: Update dependencies
- Updated dependencies [416c0d2]
- Updated dependencies [aadf0fe]
  - @web/test-runner-coverage-v8@0.2.1
  - @web/test-runner-core@0.8.4

## 0.6.3

### Patch Changes

- 735658a: share the same browser context across pages

## 0.6.2

### Patch Changes

- c256a08: allow configuring concurrency per browser launcher
- Updated dependencies [c256a08]
  - @web/test-runner-core@0.8.3

## 0.6.1

### Patch Changes

- 859008b: added experimental mode to test workflows where tests on firefox require the browser window to be focused
- Updated dependencies [859008b]
  - @web/test-runner-core@0.8.2

## 0.6.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/test-runner-core@0.8.0
  - @web/test-runner-coverage-v8@0.2.0

## 0.5.8

### Patch Changes

- 88cc7ac: Reworked concurrent scheduling logic

  When running tests in multiple browsers, the browsers are no longer all started in parallel. Instead a new `concurrentBrowsers` property controls how many browsers are run concurrently. This helps improve speed and stability.

- Updated dependencies [88cc7ac]
  - @web/test-runner-core@0.7.19

## 0.5.7

### Patch Changes

- cde5d29: add browser logging for all browser launchers
- Updated dependencies [cde5d29]
- Updated dependencies [cde5d29]
  - @web/test-runner-core@0.7.15

## 0.5.6

### Patch Changes

- be3c9ed: track and log page reloads
- 2802df6: handle cases where reloading the page creates an infinite loop
- Updated dependencies [be3c9ed]
  - @web/test-runner-core@0.7.10

## 0.5.5

### Patch Changes

- 41d895f: capture native browser errors

## 0.5.4

### Patch Changes

- ce2a2e6: align dependencies
- Updated dependencies [ce2a2e6]
  - @web/test-runner-coverage-v8@0.1.2

## 0.5.3

### Patch Changes

- 22c85b5: fix handle race condition when starting browser

## 0.5.2

### Patch Changes

- e71eae9: restart browser on timeout
- Updated dependencies [60de9b5]
  - @web/browser-logs@0.1.2

## 0.5.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/browser-logs@0.1.1
  - @web/test-runner-core@0.7.1
  - @web/test-runner-coverage-v8@0.1.1

## 0.5.0

### Minor Changes

- cdddf68: Removed support for `@web/test-runner-helpers`. This is a breaking change, the functionality is now available in `@web/test-runner-commands`.
- fdcf2e5: Merged test runner server into core, and made it no longer possible configure a different server.

  The test runner relies on the server for many things, merging it into core makes the code more maintainable. The server is composable, you can proxy requests to other servers and we can look into adding more composition APIs later.

- 9be1f95: Added native node es module entrypoints. This is a breaking change. Before, native node es module imports would import a CJS module as a default import and require destructuring afterwards:

  ```js
  import playwrightModule from '@web/test-runner-playwright';

  const { playwrightLauncher } = playwrightModule;
  ```

  Now, the exports are only available directly as a named export:

  ```js
  import { playwrightLauncher } from '@web/test-runner-playwright';
  ```

### Patch Changes

- Updated dependencies [cdddf68]
- Updated dependencies [fdcf2e5]
- Updated dependencies [62ff8b2]
- Updated dependencies [9be1f95]
  - @web/test-runner-core@0.7.0
  - @web/browser-logs@0.1.0
  - @web/test-runner-coverage-v8@0.1.0

## 0.4.22

### Patch Changes

- c1e9884: fix checking for native instrumentation

## 0.4.21

### Patch Changes

- d77093b: allow code coverage instrumentation through JS
- Updated dependencies [d77093b]
  - @web/test-runner-core@0.6.23

## 0.4.20

### Patch Changes

- f0fe1f0: update to playwright 1.3.x

## 0.4.19

### Patch Changes

- 02a3926: expose browser name from BrowserLauncher
- 74cc129: implement commands API
- Updated dependencies [02a3926]
- Updated dependencies [74cc129]
  - @web/test-runner-core@0.6.22

## 0.4.18

### Patch Changes

- cbdf3c7: chore: merge browser lib into test-runner-core
- Updated dependencies [cbdf3c7]
  - @web/test-runner-core@0.6.21

## 0.4.17

### Patch Changes

- 432f090: expose browser name from BrowserLauncher
- 5b36825: prevent debug sessions from interferring with regular test sessions
- Updated dependencies [432f090]
- Updated dependencies [5b36825]
  - @web/test-runner-core@0.6.19

## 0.4.16

### Patch Changes

- 736d101: improve scheduling logic and error handling
- Updated dependencies [736d101]
  - @web/test-runner-core@0.6.18

## 0.4.15

### Patch Changes

- 4e3de03: fix a potential race condition when starting a new test

## 0.4.14

### Patch Changes

- 7c25ba4: guard against the logs script being unavailable

## 0.4.13

### Patch Changes

- Updated dependencies [ad11e36]
  - @web/test-runner-coverage-v8@0.0.4

## 0.4.12

### Patch Changes

- 911aa74: remove log serialization workaround

## 0.4.11

### Patch Changes

- 5fada4a: improve logging and error reporting
- Updated dependencies [5fada4a]
  - @web/browser-logs@0.0.1
  - @web/test-runner-core@0.6.16

## 0.4.10

### Patch Changes

- 7a22269: allow customize browser page creation

## 0.4.9

### Patch Changes

- Updated dependencies [db5baff]
  - @web/test-runner-core@0.6.9
  - @web/test-runner-coverage-v8@0.0.3

## 0.4.8

### Patch Changes

- c72ea22: allow configuring browser launch options
- Updated dependencies [c72ea22]
  - @web/test-runner-core@0.6.7

## 0.4.7

### Patch Changes

- 6bcf981: correctly map pages to browsers

## 0.4.6

### Patch Changes

- 4a6b9c2: make coverage work in watch mode
- Updated dependencies [4a6b9c2]
  - @web/test-runner-core@0.6.6

## 0.4.5

### Patch Changes

- 1d6d498: allow changing viewport in tests
- Updated dependencies [1d6d498]
  - @web/test-runner-core@0.6.5

## 0.4.4

### Patch Changes

- afc3cc7: update dependencies

## 0.4.3

### Patch Changes

- Updated dependencies [835b30c]
  - @web/test-runner-coverage-v8@0.0.2

## 0.4.2

### Patch Changes

- 5ab18d8: feat(test-runner-core): batch v8 test coverage
- Updated dependencies [5ab18d8]
  - @web/test-runner-core@0.6.4

## 0.4.1

### Patch Changes

- 3dab600: profile test coverage through v8/chromium
- Updated dependencies [3dab600]
  - @web/test-runner-core@0.6.2
  - @web/test-runner-coverage-v8@0.0.1

## 0.4.0

### Minor Changes

- c4cb321: Use web dev server in test runner. This contains multiple breaking changes:

  - Browsers that don't support es modules are not supported for now. We will add this back later.
  - Most es-dev-server config options are no longer available. The only options that are kept are `plugins`, `middleware`, `nodeResolve` and `preserveSymlinks`.
  - Test runner config changes:
    - Dev server options are not available on the root level of the configuration file.
    - `nodeResolve` is no longer enabled by default. You can enable it with the `--node-resolve` flag or `nodeResolve` option.
    - `middlewares` option is now called `middleware`.
    - `testFrameworkImport` is now called `testFramework`.
    - `address` is now split into `protocol` and `hostname`.

### Patch Changes

- Updated dependencies [c4cb321]
  - @web/test-runner-core@0.6.0

## 0.3.4

### Patch Changes

- 14b7fae: handle errors in mocha hooks
- Updated dependencies [14b7fae]
  - @web/test-runner-core@0.5.6

## 0.3.3

### Patch Changes

- 56ed519: open browser windows sequentially in selenium
- Updated dependencies [56ed519]
  - @web/test-runner-core@0.5.5

## 0.3.2

### Patch Changes

- 0f8935d: make going to a URL non-blocking
- Updated dependencies [64d867c]
  - @web/test-runner-core@0.5.3

## 0.3.1

### Patch Changes

- 45a2f21: add ability to run HTML tests
- Updated dependencies [45a2f21]
  - @web/test-runner-core@0.5.1

## 0.3.0

### Minor Changes

- 1d277e9: rename framework to browser-lib

### Patch Changes

- Updated dependencies [1d277e9]
  - @web/test-runner-core@0.5.0

## 0.2.0

### Minor Changes

- ccb63df: @web/test-runner-dev-server to @web/test-runner-server

### Patch Changes

- Updated dependencies [ccb63df]
  - @web/test-runner-core@0.4.0

## 0.1.2

### Patch Changes

- Updated dependencies [0c83d7e]
  - @web/test-runner-core@0.3.0

## 0.1.1

### Patch Changes

- 115442b: add readme, package tags and description
- Updated dependencies [115442b]
  - @web/test-runner-core@0.2.5

## 0.1.0

### Minor Changes

- 9578c89: first setup
