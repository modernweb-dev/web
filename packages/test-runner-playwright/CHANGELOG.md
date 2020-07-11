# @web/test-runner-playwright

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
