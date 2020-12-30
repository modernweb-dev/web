# @web/test-runner-puppeteer

## 0.8.2

### Patch Changes

- cbbeae3f: allow configuring puppeteer and playwright browser context
- Updated dependencies [cbbeae3f]
  - @web/test-runner-chrome@0.8.2

## 0.8.1

### Patch Changes

- 69b2d13d: use about:blank to kill stale browser pages, this makes tests that rely on browser focus work with puppeteer
- Updated dependencies [69b2d13d]
- Updated dependencies [005ab9ae]
  - @web/test-runner-chrome@0.8.1

## 0.8.0

### Minor Changes

- 6e313c18: merged @web/test-runner-cli package into @web/test-runner

### Patch Changes

- Updated dependencies [6e313c18]
- Updated dependencies [0f613e0e]
  - @web/test-runner-core@0.9.0
  - @web/test-runner-chrome@0.8.0

## 0.7.3

### Patch Changes

- 2278a95: bump dependencies
- Updated dependencies [2278a95]
  - @web/test-runner-chrome@0.7.3
  - @web/test-runner-core@0.8.11

## 0.7.2

### Patch Changes

- 416c0d2: Update dependencies
- Updated dependencies [416c0d2]
- Updated dependencies [aadf0fe]
  - @web/test-runner-chrome@0.7.2
  - @web/test-runner-core@0.8.4

## 0.7.1

### Patch Changes

- c256a08: allow configuring concurrency per browser launcher
- Updated dependencies [c256a08]
  - @web/test-runner-chrome@0.7.1
  - @web/test-runner-core@0.8.3

## 0.7.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/test-runner-chrome@0.7.0
  - @web/test-runner-core@0.8.0

## 0.6.4

### Patch Changes

- 88cc7ac: Reworked concurrent scheduling logic

  When running tests in multiple browsers, the browsers are no longer all started in parallel. Instead a new `concurrentBrowsers` property controls how many browsers are run concurrently. This helps improve speed and stability.

- Updated dependencies [88cc7ac]
  - @web/test-runner-chrome@0.6.8
  - @web/test-runner-core@0.7.19

## 0.6.3

### Patch Changes

- ce2a2e6: align dependencies
- Updated dependencies [ce2a2e6]
  - @web/test-runner-chrome@0.6.4

## 0.6.2

### Patch Changes

- 4d29bb4: restart browser after timeout
- Updated dependencies [4d29bb4]
  - @web/test-runner-chrome@0.6.2

## 0.6.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/test-runner-chrome@0.6.1
  - @web/test-runner-core@0.7.1

## 0.6.0

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
  - @web/test-runner-chrome@0.6.0
  - @web/test-runner-core@0.7.0

## 0.5.12

### Patch Changes

- f924a9b: improve support for puppeteer firefox
- Updated dependencies [f924a9b]
  - @web/test-runner-chrome@0.5.21

## 0.5.11

### Patch Changes

- d77093b: allow code coverage instrumentation through JS
- Updated dependencies [d77093b]
  - @web/test-runner-chrome@0.5.20
  - @web/test-runner-core@0.6.23

## 0.5.10

### Patch Changes

- 02a3926: expose browser name from BrowserLauncher
- 74cc129: implement commands API
- Updated dependencies [02a3926]
- Updated dependencies [74cc129]
  - @web/test-runner-chrome@0.5.19
  - @web/test-runner-core@0.6.22

## 0.5.9

### Patch Changes

- cbdf3c7: chore: merge browser lib into test-runner-core
- Updated dependencies [cbdf3c7]
  - @web/test-runner-chrome@0.5.18
  - @web/test-runner-core@0.6.21

## 0.5.8

### Patch Changes

- 432f090: expose browser name from BrowserLauncher
- 5b36825: prevent debug sessions from interferring with regular test sessions
- Updated dependencies [432f090]
- Updated dependencies [5b36825]
  - @web/test-runner-chrome@0.5.17
  - @web/test-runner-core@0.6.19

## 0.5.7

### Patch Changes

- 736d101: improve scheduling logic and error handling
- Updated dependencies [736d101]
  - @web/test-runner-chrome@0.5.16
  - @web/test-runner-core@0.6.18

## 0.5.6

### Patch Changes

- 5fada4a: improve logging and error reporting
- Updated dependencies [5fada4a]
  - @web/test-runner-chrome@0.5.12
  - @web/test-runner-core@0.6.16

## 0.5.5

### Patch Changes

- 7a22269: allow customize browser page creation
- Updated dependencies [7a22269]
  - @web/test-runner-chrome@0.5.11

## 0.5.4

### Patch Changes

- c72ea22: allow configuring browser launch options
- Updated dependencies [c72ea22]
  - @web/test-runner-chrome@0.5.7
  - @web/test-runner-core@0.6.7

## 0.5.3

### Patch Changes

- afc3cc7: update dependencies
- Updated dependencies [afc3cc7]
  - @web/test-runner-chrome@0.5.4

## 0.5.2

### Patch Changes

- 835b30c: update dependencies
  - @web/test-runner-chrome@0.5.3

## 0.5.1

### Patch Changes

- 3dab600: profile test coverage through v8/chromium
- Updated dependencies [3dab600]
  - @web/test-runner-chrome@0.5.1
  - @web/test-runner-core@0.6.2

## 0.5.0

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
  - @web/test-runner-chrome@0.5.0
  - @web/test-runner-core@0.6.0

## 0.4.4

### Patch Changes

- 14b7fae: handle errors in mocha hooks
- Updated dependencies [14b7fae]
  - @web/test-runner-chrome@0.4.4
  - @web/test-runner-core@0.5.6

## 0.4.3

### Patch Changes

- 56ed519: open browser windows sequentially in selenium
- Updated dependencies [56ed519]
  - @web/test-runner-chrome@0.4.3
  - @web/test-runner-core@0.5.5

## 0.4.2

### Patch Changes

- 0f8935d: make going to a URL non-blocking
- Updated dependencies [64d867c]
- Updated dependencies [0f8935d]
  - @web/test-runner-core@0.5.3
  - @web/test-runner-chrome@0.4.2

## 0.4.1

### Patch Changes

- 45a2f21: add ability to run HTML tests
- Updated dependencies [45a2f21]
  - @web/test-runner-chrome@0.4.1
  - @web/test-runner-core@0.5.1

## 0.4.0

### Minor Changes

- 1d277e9: rename framework to browser-lib

### Patch Changes

- Updated dependencies [1d277e9]
  - @web/test-runner-chrome@0.4.0
  - @web/test-runner-core@0.5.0

## 0.3.0

### Minor Changes

- ccb63df: @web/test-runner-dev-server to @web/test-runner-server

### Patch Changes

- Updated dependencies [ccb63df]
  - @web/test-runner-chrome@0.3.0
  - @web/test-runner-core@0.4.0

## 0.2.3

### Patch Changes

- Updated dependencies [0c83d7e]
  - @web/test-runner-core@0.3.0

## 0.2.2

### Patch Changes

- 115442b: add readme, package tags and description
- Updated dependencies [115442b]
  - @web/test-runner-chrome@0.2.2
  - @web/test-runner-core@0.2.5

## 0.2.1

### Patch Changes

- Updated dependencies [79f9e6b]
  - @web/test-runner-chrome@0.2.0

## 0.2.0

### Minor Changes

- cf49d42: use @web/test-runner-chrome as a base

### Patch Changes

- Updated dependencies [97e85e6]
- Updated dependencies [37eb13a]
  - @web/test-runner-chrome@0.1.0
  - @web/test-runner-core@0.2.0

## 0.1.0

### Minor Changes

- 38b4e20: first setup
