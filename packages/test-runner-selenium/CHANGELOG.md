# @web/test-runner-selenium

## 0.3.3

### Patch Changes

- b6e703a: clear heartbeat interval properly

## 0.3.2

### Patch Changes

- 9cf02b9: add heartbeat interval to keep connection alive

## 0.3.1

### Patch Changes

- 416c0d2: Update dependencies
- Updated dependencies [aadf0fe]
  - @web/test-runner-core@0.8.4

## 0.3.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/test-runner-core@0.8.0

## 0.2.9

### Patch Changes

- 38d8f03: turn on selenium iframe mode by default

## 0.2.8

### Patch Changes

- f5d6086: improve iframe mode speed

## 0.2.7

### Patch Changes

- 88cc7ac: Reworked concurrent scheduling logic

  When running tests in multiple browsers, the browsers are no longer all started in parallel. Instead a new `concurrentBrowsers` property controls how many browsers are run concurrently. This helps improve speed and stability.

- Updated dependencies [88cc7ac]
  - @web/test-runner-core@0.7.19

## 0.2.6

### Patch Changes

- 4ac0b3a: added experimental iframes mode to test improve speed when testing with selenium
- Updated dependencies [4ac0b3a]
  - @web/test-runner-core@0.7.17

## 0.2.5

### Patch Changes

- 994f6e4: improved the way browser names are generated

## 0.2.4

### Patch Changes

- be3c9ed: track and log page reloads
- 2802df6: handle cases where reloading the page creates an infinite loop
- Updated dependencies [be3c9ed]
  - @web/test-runner-core@0.7.10

## 0.2.3

### Patch Changes

- dbbb6db: run tests in parallel

## 0.2.2

### Patch Changes

- ce2a2e6: align dependencies

## 0.2.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/test-runner-core@0.7.1

## 0.2.0

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

## 0.1.8

### Patch Changes

- d77093b: allow code coverage instrumentation through JS

## 0.1.7

### Patch Changes

- 02a3926: expose browser name from BrowserLauncher
- 74cc129: implement commands API

## 0.1.6

### Patch Changes

- 432f090: expose browser name from BrowserLauncher
- 5b36825: prevent debug sessions from interferring with regular test sessions

## 0.1.5

### Patch Changes

- 736d101: improve scheduling logic and error handling

## 0.1.4

### Patch Changes

- 5fada4a: improve logging and error reporting

## 0.1.3

### Patch Changes

- 04a2cda: make test-runner-browserstack work with dev-server-core

## 0.1.2

### Patch Changes

- c72ea22: allow configuring browser launch options

## 0.1.1

### Patch Changes

- 1d6d498: allow changing viewport in tests

## 0.1.0

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

## 0.0.4

### Patch Changes

- 14b7fae: handle errors in mocha hooks

## 0.0.3

### Patch Changes

- fbc1eba: don't run tests in parallel

## 0.0.2

### Patch Changes

- 56ed519: open browser windows sequentially in selenium

## 0.0.1

### Patch Changes

- ebfdfd2: add selenium browser launcher
