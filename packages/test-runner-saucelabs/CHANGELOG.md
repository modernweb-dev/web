# @web/test-runner-saucelabs

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
