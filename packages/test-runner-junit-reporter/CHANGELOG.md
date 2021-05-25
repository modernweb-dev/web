# @web/test-runner-junit-reporter

## 0.4.3

### Patch Changes

- 0609aa00: fix logging non UTF-8 characters (e.g. ANSI escape seq) produces malformed junit xml report

## 0.4.2

### Patch Changes

- Updated dependencies [a6a018da]
- Updated dependencies [2c06f31e]
  - @web/test-runner-chrome@0.10.0

## 0.4.1

### Patch Changes

- e3314b02: update dependency on core

## 0.4.0

### Minor Changes

- a7d74fdc: drop support for node v10 and v11
- 1dd7cd0e: version bump after breaking change in @web/test-runner-core

### Patch Changes

- Updated dependencies [1dd7cd0e]
- Updated dependencies [a7d74fdc]
- Updated dependencies [1dd7cd0e]
  - @web/test-runner-core@0.10.0
  - @web/test-runner-chrome@0.9.0

## 0.3.0

### Minor Changes

- 6e313c18: merged @web/test-runner-cli package into @web/test-runner

### Patch Changes

- Updated dependencies [6e313c18]
- Updated dependencies [0f613e0e]
  - @web/test-runner-core@0.9.0
  - @web/test-runner-chrome@0.8.0

## 0.2.1

### Patch Changes

- 416c0d2: Update dependencies
- Updated dependencies [416c0d2]
- Updated dependencies [aadf0fe]
  - @web/test-runner-chrome@0.7.2
  - @web/test-runner-cli@0.6.4
  - @web/test-runner-core@0.8.4

## 0.2.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/test-runner-chrome@0.7.0
  - @web/test-runner-cli@0.6.0
  - @web/test-runner-core@0.8.0

## 0.1.3

### Patch Changes

- 88cc7ac: Reworked concurrent scheduling logic

  When running tests in multiple browsers, the browsers are no longer all started in parallel. Instead a new `concurrentBrowsers` property controls how many browsers are run concurrently. This helps improve speed and stability.

- Updated dependencies [88cc7ac]
  - @web/test-runner-chrome@0.6.8
  - @web/test-runner-cli@0.5.15
  - @web/test-runner-core@0.7.19

## 0.1.2

### Patch Changes

- ce2a2e6: align dependencies
- Updated dependencies [ce2a2e6]
  - @web/test-runner-chrome@0.6.4
  - @web/test-runner-cli@0.5.4
