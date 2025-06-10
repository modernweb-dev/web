# @web/test-runner-saucelabs

## 0.13.0

### Minor Changes

- 64e873c: Bump saucelabs to 9.0.0 and update test-runner-saucelabs to changes in the new version.
  The new version contains breaking changes, see the migration guide for more information: https://docs.saucelabs.com/secure-connections/sauce-connect-5/migrating/.

## 0.12.1

### Patch Changes

- 736e669: Use correct type for providing SauceLabsCapabilities object in createSauceLabsLauncher

## 0.12.0

### Minor Changes

- e755f6b: Upgrade WebdriverIO to v9, drop JWP capabilities

### Patch Changes

- Updated dependencies [e755f6b]
  - @web/test-runner-webdriver@0.9.0

## 0.11.2

### Patch Changes

- 39ff6ffb: replace ip dependency due to security bug CVE-2024-29415

## 0.11.1

### Patch Changes

- e657791f: Vulnerability fix in `ip` package.
  For more info, see:

  - https://github.com/advisories/GHSA-78xj-cgh5-2h22
  - https://github.com/indutny/node-ip/issues/136#issuecomment-1952083593

## 0.11.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/test-runner-webdriver@0.8.0

## 0.10.1

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/test-runner-webdriver@0.7.1

## 0.10.0

### Minor Changes

- 812400a3: Update `webdriver` to version 8

### Patch Changes

- Updated dependencies [812400a3]
  - @web/test-runner-webdriver@0.7.0

## 0.9.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.

### Patch Changes

- Updated dependencies [febd9d9d]
  - @web/test-runner-webdriver@0.6.0

## 0.8.1

### Patch Changes

- b25d3fd3: Update `@web/test-runner-webdriver` dependency to `^0.5.1`.

## 0.8.0

### Minor Changes

- 94291532: Update SauceLabs version to 7.2.0

## 0.7.3

### Patch Changes

- Updated dependencies [064b9dde]
  - @web/test-runner-webdriver@0.5.0

## 0.7.2

### Patch Changes

- 7e46ba7c: Pin saucelabs version to 6.1.0 minor

## 0.7.1

### Patch Changes

- bfa1d1ca: Update webdriver dependency to 7.16.0
- Updated dependencies [bfa1d1ca]
  - @web/test-runner-webdriver@0.4.3

## 0.7.0

### Minor Changes

- 6fb8910c: Update dependency saucelabs to v6

## 0.6.3

### Patch Changes

- d4f92e25: Replace uuid dependency with nanoid

## 0.6.2

### Patch Changes

- 33ada3d8: Align @web/test-runner-core version
- Updated dependencies [33ada3d8]
  - @web/test-runner-webdriver@0.4.2

## 0.6.1

### Patch Changes

- 6014eba2: Bump webdriverio dependency to 7.9.0
- Updated dependencies [6014eba2]
  - @web/test-runner-webdriver@0.4.1

## 0.6.0

### Minor Changes

- 5d440dbd: Bump webdriverio to 7.7.4

### Patch Changes

- Updated dependencies [5d440dbd]
  - @web/test-runner-webdriver@0.4.0

## 0.5.0

### Minor Changes

- d1227d88: Update webdriverio dependency to v7

### Patch Changes

- Updated dependencies [d1227d88]
  - @web/test-runner-webdriver@0.3.0

## 0.4.2

### Patch Changes

- 8861ded8: feat(dev-server-core): share websocket instances with iframe parent
- Updated dependencies [8861ded8]
  - @web/test-runner-webdriver@0.2.2

## 0.4.1

### Patch Changes

- 967f12d9: Fix intermittent testsStartTimeout on Safari on Sauce
- Updated dependencies [967f12d9]
  - @web/test-runner-webdriver@0.2.1

## 0.4.0

### Minor Changes

- a7d74fdc: drop support for node v10 and v11
- 1dd7cd0e: version bump after breaking change in @web/test-runner-core

### Patch Changes

- Updated dependencies [a7d74fdc]
- Updated dependencies [1dd7cd0e]
  - @web/test-runner-webdriver@0.2.0

## 0.3.3

### Patch Changes

- 69b2d13d: use about:blank to kill stale browser pages, this makes tests that rely on browser focus work with puppeteer
- Updated dependencies [69b2d13d]
- Updated dependencies [c7f8d271]
  - @web/test-runner-webdriver@0.1.3
  - @web/dev-server-esbuild@0.2.10

## 0.3.2

### Patch Changes

- 75fba3d0: lazily create webdriver connection
- Updated dependencies [75fba3d0]
  - @web/test-runner-webdriver@0.1.2

## 0.3.1

### Patch Changes

- 5b117da4: add heartbeat to webdriver launcher
- Updated dependencies [5b117da4]
  - @web/test-runner-webdriver@0.1.1

## 0.3.0

### Minor Changes

- 6e313c18: merged @web/test-runner-cli package into @web/test-runner

### Patch Changes

- Updated dependencies [6e313c18]
  - @web/test-runner-webdriver@0.1.0
  - @web/dev-server-esbuild@0.2.9

## 0.2.0

### Minor Changes

- 18b3766: Use Webdriver launcher, support JWP capabilities

## 0.1.3

### Patch Changes

- b6e703a: clear heartbeat interval properly
- Updated dependencies [b6e703a]
  - @web/test-runner-selenium@0.3.3

## 0.1.2

### Patch Changes

- 9cf02b9: add heartbeat interval to keep connection alive
- Updated dependencies [9cf02b9]
  - @web/test-runner-selenium@0.3.2

## 0.1.1

### Patch Changes

- 416c0d2: Update dependencies
- Updated dependencies [416c0d2]
  - @web/test-runner-selenium@0.3.1

## 0.1.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/test-runner-selenium@0.3.0

## 0.0.9

### Patch Changes

- bd27fff: improve browser and proxy close logic

## 0.0.8

### Patch Changes

- 38d8f03: turn on selenium iframe mode by default
- Updated dependencies [38d8f03]
  - @web/test-runner-selenium@0.2.9

## 0.0.7

### Patch Changes

- f5d6086: improve iframe mode speed
- Updated dependencies [f5d6086]
  - @web/test-runner-selenium@0.2.8

## 0.0.6

### Patch Changes

- 88cc7ac: Reworked concurrent scheduling logic

  When running tests in multiple browsers, the browsers are no longer all started in parallel. Instead a new `concurrentBrowsers` property controls how many browsers are run concurrently. This helps improve speed and stability.

- Updated dependencies [88cc7ac]
  - @web/test-runner-selenium@0.2.7

## 0.0.5

### Patch Changes

- 4ac0b3a: added experimental iframes mode to test improve speed when testing with selenium
- Updated dependencies [4ac0b3a]
  - @web/test-runner-selenium@0.2.6

## 0.0.4

### Patch Changes

- c25acbc: use webdriver endpoint from saucelabs library
- ae6fd15: close webdriver before proxy
- Updated dependencies [994f6e4]
  - @web/test-runner-selenium@0.2.5

## 0.0.3

### Patch Changes

- a77914f: improved closing of saucelabs tunnel connection

## 0.0.2

### Patch Changes

- dbbb6db: run tests in parallel
- Updated dependencies [dbbb6db]
  - @web/test-runner-selenium@0.2.3

## 0.0.1

### Patch Changes

- d2e8b16: first implementation
