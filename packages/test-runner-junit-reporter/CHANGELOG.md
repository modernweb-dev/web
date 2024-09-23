# @web/test-runner-junit-reporter

## 0.7.2

### Patch Changes

- Updated dependencies [b546e8b5]
  - @web/test-runner-chrome@0.17.0

## 0.7.1

### Patch Changes

- Updated dependencies [4cc90648]
  - @web/test-runner-chrome@0.16.0

## 0.7.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/test-runner-chrome@0.15.0
  - @web/test-runner-core@0.13.0

## 0.6.3

### Patch Changes

- Updated dependencies [43be7391]
  - @web/test-runner-core@0.12.0
  - @web/test-runner-chrome@0.14.4

## 0.6.2

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/test-runner-chrome@0.14.3
  - @web/test-runner-core@0.11.6

## 0.6.1

### Patch Changes

- Updated dependencies [0c87f59e]
  - @web/test-runner-chrome@0.14.0

## 0.6.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.
- b7d8ee66: Update mocha from version 8.2.0 to version 10.2.0

### Patch Changes

- Updated dependencies [febd9d9d]
  - @web/test-runner-chrome@0.13.0
  - @web/test-runner-core@0.11.0

## 0.5.2

### Patch Changes

- 8128ca53: Update @rollup/plugin-replace
- Updated dependencies [77e413d9]
- Updated dependencies [cdeafe4a]
- Updated dependencies [1113fa09]
- Updated dependencies [817d674b]
- Updated dependencies [445b20e6]
- Updated dependencies [bd12ff9b]
- Updated dependencies [8128ca53]
  - @web/test-runner-chrome@0.12.1
  - @web/test-runner-core@0.10.29

## 0.5.1

### Patch Changes

- Updated dependencies [0e198dcc]
  - @web/test-runner-chrome@0.12.0

## 0.5.0

### Minor Changes

- acca5d51: Update dependency v8-to-istanbul to v9

### Patch Changes

- Updated dependencies [acca5d51]
  - @web/test-runner-chrome@0.11.0

## 0.4.11

### Patch Changes

- 7c2fa463: Update puppeteer-core and puppeteer to v13
- Updated dependencies [7c2fa463]
  - @web/test-runner-chrome@0.10.6

## 0.4.10

### Patch Changes

- cdef38b3: Adds file and line number support to junit reporter
- Updated dependencies [cdef38b3]
- Updated dependencies [f4ed8156]
  - @web/test-runner-core@0.10.23

## 0.4.9

### Patch Changes

- 3f79c247: Update dependency chrome-launcher to ^0.15.0
- Updated dependencies [3f79c247]
  - @web/test-runner-chrome@0.10.5

## 0.4.8

### Patch Changes

- aab9a42f: Update dependency puppeteer-core to v11
- Updated dependencies [aab9a42f]
  - @web/test-runner-chrome@0.10.4

## 0.4.7

### Patch Changes

- de756b28: Update dependency puppeteer-core to v10
- Updated dependencies [de756b28]
  - @web/test-runner-chrome@0.10.3

## 0.4.6

### Patch Changes

- 33ada3d8: Align @web/test-runner-core version
- Updated dependencies [33ada3d8]
  - @web/test-runner-chrome@0.10.2

## 0.4.5

### Patch Changes

- 73681b6d: Allow user config to be partial
- Updated dependencies [73681b6d]
  - @web/test-runner-core@0.10.19

## 0.4.4

### Patch Changes

- 94cddfab: fix: allow stripXMLInvalidChars when replace it not available

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
