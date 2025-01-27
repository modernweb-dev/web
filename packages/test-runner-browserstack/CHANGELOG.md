# @web/test-runner-browserstack

## 0.8.0

### Minor Changes

- e755f6b: Upgrade WebdriverIO to v9, drop JWP capabilities

### Patch Changes

- Updated dependencies [e755f6b]
  - @web/test-runner-webdriver@0.9.0

## 0.7.2

### Patch Changes

- 39ff6ffb: replace ip dependency due to security bug CVE-2024-29415

## 0.7.1

### Patch Changes

- e657791f: Vulnerability fix in `ip` package.
  For more info, see:

  - https://github.com/advisories/GHSA-78xj-cgh5-2h22
  - https://github.com/indutny/node-ip/issues/136#issuecomment-1952083593

## 0.7.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/test-runner-webdriver@0.8.0

## 0.6.2

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/test-runner-webdriver@0.7.1

## 0.6.1

### Patch Changes

- Updated dependencies [812400a3]
  - @web/test-runner-webdriver@0.7.0

## 0.6.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.

### Patch Changes

- Updated dependencies [febd9d9d]
  - @web/test-runner-webdriver@0.6.0

## 0.5.1

### Patch Changes

- b25d3fd3: Update `@web/test-runner-webdriver` dependency to `^0.5.1`.

## 0.5.0

### Minor Changes

- 9a2580a8: Migrates `BrowserstackLauncher` to extend from `WebdriverLauncher` instead of `SeleniumLauncher`. This allows the visual regression plugin to work with said launcher.

## 0.4.4

### Patch Changes

- 1066c0b1: Update selenium-webdriver dependency to 4.0.0
- Updated dependencies [1066c0b1]
  - @web/test-runner-selenium@0.5.3

## 0.4.3

### Patch Changes

- d4f92e25: Replace uuid dependency with nanoid

## 0.4.2

### Patch Changes

- 8861ded8: feat(dev-server-core): share websocket instances with iframe parent

## 0.4.1

### Patch Changes

- 967f12d9: Fix intermittent testsStartTimeout on Safari on Sauce

## 0.4.0

### Minor Changes

- a7d74fdc: drop support for node v10 and v11
- 1dd7cd0e: version bump after breaking change in @web/test-runner-core

### Patch Changes

- Updated dependencies [a7d74fdc]
- Updated dependencies [1dd7cd0e]
  - @web/test-runner-selenium@0.5.0

## 0.3.3

### Patch Changes

- 69b2d13d: use about:blank to kill stale browser pages, this makes tests that rely on browser focus work with puppeteer
- Updated dependencies [69b2d13d]
  - @web/test-runner-selenium@0.4.1

## 0.3.2

### Patch Changes

- 75fba3d0: lazily create webdriver connection

## 0.3.1

### Patch Changes

- 5b117da4: add heartbeat to webdriver launcher

## 0.3.0

### Minor Changes

- 6e313c18: merged @web/test-runner-cli package into @web/test-runner

### Patch Changes

- Updated dependencies [6e313c18]
  - @web/test-runner-selenium@0.4.0

## 0.2.3

### Patch Changes

- b6e703a: clear heartbeat interval properly
- Updated dependencies [b6e703a]
  - @web/test-runner-selenium@0.3.3

## 0.2.2

### Patch Changes

- 9cf02b9: add heartbeat interval to keep connection alive
- Updated dependencies [9cf02b9]
  - @web/test-runner-selenium@0.3.2

## 0.2.1

### Patch Changes

- 416c0d2: Update dependencies
- Updated dependencies [416c0d2]
  - @web/test-runner-selenium@0.3.1

## 0.2.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/test-runner-selenium@0.3.0

## 0.1.6

### Patch Changes

- bd27fff: improve browser and proxy close logic

## 0.1.5

### Patch Changes

- 38d8f03: turn on selenium iframe mode by default
- Updated dependencies [38d8f03]
  - @web/test-runner-selenium@0.2.9

## 0.1.4

### Patch Changes

- 88cc7ac: Reworked concurrent scheduling logic

  When running tests in multiple browsers, the browsers are no longer all started in parallel. Instead a new `concurrentBrowsers` property controls how many browsers are run concurrently. This helps improve speed and stability.

- Updated dependencies [88cc7ac]
  - @web/test-runner-selenium@0.2.7

## 0.1.3

### Patch Changes

- dbbb6db: run tests in parallel
- Updated dependencies [dbbb6db]
  - @web/test-runner-selenium@0.2.3

## 0.1.2

### Patch Changes

- ce2a2e6: align dependencies
- Updated dependencies [ce2a2e6]
  - @web/dev-server-legacy@0.1.2
  - @web/test-runner-selenium@0.2.2

## 0.1.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/dev-server-legacy@0.1.1
  - @web/test-runner-selenium@0.2.1

## 0.1.0

### Minor Changes

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
- Updated dependencies [9be1f95]
  - @web/test-runner-selenium@0.2.0
  - @web/dev-server-legacy@0.1.0

## 0.0.12

### Patch Changes

- d77093b: allow code coverage instrumentation through JS
- Updated dependencies [d77093b]
  - @web/test-runner-selenium@0.1.8

## 0.0.11

### Patch Changes

- 02a3926: expose browser name from BrowserLauncher
- Updated dependencies [02a3926]
- Updated dependencies [74cc129]
  - @web/test-runner-selenium@0.1.7

## 0.0.10

### Patch Changes

- 432f090: expose browser name from BrowserLauncher
- 5b36825: prevent debug sessions from interferring with regular test sessions
- Updated dependencies [432f090]
- Updated dependencies [5b36825]
  - @web/test-runner-selenium@0.1.6

## 0.0.9

### Patch Changes

- 736d101: improve scheduling logic and error handling
- Updated dependencies [736d101]
  - @web/test-runner-selenium@0.1.5

## 0.0.8

### Patch Changes

- 5fada4a: improve logging and error reporting
- Updated dependencies [5fada4a]
  - @web/dev-server-legacy@0.0.3
  - @web/test-runner-selenium@0.1.4

## 0.0.7

### Patch Changes

- 04a2cda: make test-runner-browserstack work with dev-server-core
- Updated dependencies [04a2cda]
  - @web/test-runner-selenium@0.1.3

## 0.0.6

### Patch Changes

- db5baff: cleanup and sort dependencies

## 0.0.5

### Patch Changes

- 1d6d498: allow changing viewport in tests
- Updated dependencies [1d6d498]
  - @web/test-runner-selenium@0.1.1

## 0.0.4

### Patch Changes

- Updated dependencies [c4cb321]
  - @web/test-runner-selenium@0.1.0

## 0.0.3

### Patch Changes

- 14b7fae: handle errors in mocha hooks
- Updated dependencies [14b7fae]
  - @web/test-runner-selenium@0.0.4

## 0.0.2

### Patch Changes

- f2bf9ae: first setup of browserstack
- Updated dependencies [fbc1eba]
  - @web/test-runner-selenium@0.0.3
