# @web/test-runner-coverage-v8

## 0.4.8

### Patch Changes

- 33ada3d8: Align @web/test-runner-core version

## 0.4.7

### Patch Changes

- dd775c5d: Update dependency v8-to-istanbul to v8

## 0.4.6

### Patch Changes

- 3885b33e: configure timeout for fetching source maps for code coverage
- Updated dependencies [3885b33e]
  - @web/test-runner-core@0.10.9

## 0.4.5

### Patch Changes

- 4a609a18: skip non-http coverage files

## 0.4.4

### Patch Changes

- e3314b02: update dependency on core

## 0.4.3

### Patch Changes

- 9ecb49f4: release test coverage package

## 0.4.2

### Patch Changes

- ad815710: fetch source map from server when generating code coverage reports. this fixes errors when using build tools that generate source maps on the fly, which don't exist on the file system
- Updated dependencies [ad815710]
- Updated dependencies [c4738a40]
  - @web/test-runner-core@0.10.5

## 0.4.1

### Patch Changes

- d5a5f2bf: Add undeclared dependencies
- Updated dependencies [8e3b1128]
- Updated dependencies [d5a5f2bf]
  - @web/test-runner-core@0.10.3

## 0.4.0

### Minor Changes

- a7d74fdc: drop support for node v10 and v11
- 1dd7cd0e: version bump after breaking change in @web/test-runner-core

### Patch Changes

- Updated dependencies [1dd7cd0e]
- Updated dependencies [a7d74fdc]
  - @web/test-runner-core@0.10.0

## 0.3.0

### Minor Changes

- 6e313c18: merged @web/test-runner-cli package into @web/test-runner

### Patch Changes

- Updated dependencies [6e313c18]
- Updated dependencies [0f613e0e]
  - @web/test-runner-core@0.9.0

## 0.2.3

### Patch Changes

- 0614acf: update v8-to-istanbul
- Updated dependencies [2278a95]
  - @web/test-runner-core@0.8.11

## 0.2.2

### Patch Changes

- 382affc: don't require files to exist on disk for coverage

## 0.2.1

### Patch Changes

- 416c0d2: Update dependencies
- Updated dependencies [aadf0fe]
  - @web/test-runner-core@0.8.4

## 0.2.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/test-runner-core@0.8.0

## 0.1.3

### Patch Changes

- 611bb0f: updated to v8-to-istanbul v5

## 0.1.2

### Patch Changes

- ce2a2e6: align dependencies

## 0.1.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/test-runner-core@0.7.1

## 0.1.0

### Minor Changes

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

## 0.0.4

### Patch Changes

- ad11e36: resolve coverage include/exclude patterns

## 0.0.3

### Patch Changes

- db5baff: cleanup and sort dependencies
- Updated dependencies [db5baff]
  - @web/test-runner-core@0.6.9

## 0.0.2

### Patch Changes

- 835b30c: update dependencies

## 0.0.1

### Patch Changes

- 3dab600: profile test coverage through v8/chromium
- Updated dependencies [3dab600]
  - @web/test-runner-core@0.6.2
