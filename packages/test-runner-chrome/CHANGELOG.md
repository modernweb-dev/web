# @web/test-runner-chrome

## 0.5.5

### Patch Changes

- 1d6d498: allow changing viewport in tests

## 0.5.4

### Patch Changes

- afc3cc7: update dependencies

## 0.5.3

### Patch Changes

- Updated dependencies [835b30c]
  - @web/test-runner-coverage-v8@0.0.2

## 0.5.2

### Patch Changes

- 5ab18d8: feat(test-runner-core): batch v8 test coverage

## 0.5.1

### Patch Changes

- 3dab600: profile test coverage through v8/chromium
- Updated dependencies [3dab600]
  - @web/test-runner-coverage-v8@0.0.1

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

## 0.4.4

### Patch Changes

- 14b7fae: handle errors in mocha hooks

## 0.4.3

### Patch Changes

- 56ed519: open browser windows sequentially in selenium

## 0.4.2

### Patch Changes

- 0f8935d: make going to a URL non-blocking

## 0.4.1

### Patch Changes

- 45a2f21: add ability to run HTML tests

## 0.4.0

### Minor Changes

- 1d277e9: rename framework to browser-lib

## 0.3.0

### Minor Changes

- ccb63df: @web/test-runner-dev-server to @web/test-runner-server

## 0.2.2

### Patch Changes

- 115442b: add readme, package tags and description

## 0.2.1

### Patch Changes

- 6b06aca: Speed up chrome installation lookup on mac

## 0.2.0

### Minor Changes

- 79f9e6b: open browser in debug

## 0.1.0

### Minor Changes

- 97e85e6: first setup
