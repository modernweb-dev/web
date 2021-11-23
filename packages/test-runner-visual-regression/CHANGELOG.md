# @web/test-runner-visual-regression

## 0.6.4

### Patch Changes

- 7ed9355a: improve output in visual regression tests when very small differences from baseline

## 0.6.3

### Patch Changes

- 395c605d: Supply testFile to extensibility points in visualDiffPlugin, making it easy to store snapshot images alongside test files
- e56d2db0: Output diff file path to console on snapshot mismatch, making it easier to inspect results.

## 0.6.2

### Patch Changes

- 33ada3d8: Align @web/test-runner-core version
- Updated dependencies [33ada3d8]
  - @web/test-runner-commands@0.5.10

## 0.6.1

### Patch Changes

- Updated dependencies [c3ead4fa]
  - @web/test-runner-commands@0.5.0

## 0.6.0

### Minor Changes

- 2c06f31e: Update puppeteer and puppeteer-core to 8.0.0

### Patch Changes

- Updated dependencies [a6a018da]
  - @web/test-runner-commands@0.4.4

## 0.5.1

### Patch Changes

- aea269c9: Capture visual regressions across changing screenshot sizes.

## 0.5.0

### Minor Changes

- b146365a: Add `buildCache` option to the visual regression config to support always saving the "current" screenshot.
  Make the `update` option in the visual regression config _strict_, and only save "current" shots as "baseline" when it is set to `true`.

### Patch Changes

- Updated dependencies [b146365a]
  - @web/test-runner-core@0.10.13

## 0.4.1

### Patch Changes

- e3314b02: update dependency on core
- Updated dependencies [e3314b02]
  - @web/test-runner-commands@0.4.1

## 0.4.0

### Minor Changes

- a7d74fdc: drop support for node v10 and v11
- 1dd7cd0e: version bump after breaking change in @web/test-runner-core

### Patch Changes

- Updated dependencies [1dd7cd0e]
- Updated dependencies [a7d74fdc]
- Updated dependencies [1dd7cd0e]
  - @web/test-runner-core@0.10.0
  - @web/test-runner-commands@0.4.0

## 0.3.0

### Minor Changes

- 6e313c18: merged @web/test-runner-cli package into @web/test-runner

### Patch Changes

- Updated dependencies [6e313c18]
- Updated dependencies [0f613e0e]
  - @web/test-runner-core@0.9.0
  - @web/test-runner-commands@0.3.0

## 0.2.3

### Patch Changes

- c0633e4: Fixing bugs related to writing failed and diff images

## 0.2.2

### Patch Changes

- f4aedf6: Add Webdriver launcher support

## 0.2.1

### Patch Changes

- 416c0d2: Update dependencies
- Updated dependencies [416c0d2]
- Updated dependencies [aadf0fe]
  - @web/test-runner-commands@0.2.1
  - @web/test-runner-core@0.8.4

## 0.2.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/test-runner-commands@0.2.0
  - @web/test-runner-core@0.8.0

## 0.1.6

### Patch Changes

- ab97aa8: publish browser folder
- Updated dependencies [ab97aa8]
  - @web/test-runner-core@0.7.13
  - @web/test-runner-commands@0.1.6

## 0.1.5

### Patch Changes

- 632eb67: export browser and node types
- Updated dependencies [632eb67]
  - @web/test-runner-commands@0.1.4

## 0.1.4

### Patch Changes

- 05094dc: first implementation
