# @web/test-runner-chrome

## 0.5.14

### Patch Changes

- 7c25ba4: guard against the logs script being unavailable

## 0.5.13

### Patch Changes

- Updated dependencies [ad11e36]
  - @web/test-runner-coverage-v8@0.0.4

## 0.5.12

### Patch Changes

- 5fada4a: improve logging and error reporting
- Updated dependencies [5fada4a]
  - @web/browser-logs@0.0.1

## 0.5.11

### Patch Changes

- 7a22269: allow customize browser page creation

## 0.5.10

### Patch Changes

- 7db1da1: open debug in a larger browser window

## 0.5.9

### Patch Changes

- Updated dependencies [db5baff]
  - @web/test-runner-coverage-v8@0.0.3

## 0.5.8

### Patch Changes

- cfa4738: remove puppeteer dependency

## 0.5.7

### Patch Changes

- c72ea22: allow configuring browser launch options

## 0.5.6

### Patch Changes

- 4a6b9c2: make coverage work in watch mode

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
