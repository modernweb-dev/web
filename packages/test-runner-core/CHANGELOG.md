# @web/test-runner-core

## 0.6.7

### Patch Changes

- c72ea22: allow configuring browser launch options

## 0.6.6

### Patch Changes

- 4a6b9c2: make coverage work in watch mode

## 0.6.5

### Patch Changes

- 1d6d498: allow changing viewport in tests

## 0.6.4

### Patch Changes

- 5ab18d8: feat(test-runner-core): batch v8 test coverage

## 0.6.3

### Patch Changes

- a9603b5: fix merging v8 code coverage

## 0.6.2

### Patch Changes

- 3dab600: profile test coverage through v8/chromium

## 0.6.1

### Patch Changes

- d1e9bec: emit test run finished after session update

## 0.6.0

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

## 0.5.7

### Patch Changes

- 50d1036: reset request 404s on rerun

## 0.5.6

### Patch Changes

- 14b7fae: handle errors in mocha hooks

## 0.5.5

### Patch Changes

- 56ed519: open browser windows sequentially in selenium

## 0.5.4

### Patch Changes

- ebfdfd2: add selenium browser launcher

## 0.5.3

### Patch Changes

- 64d867c: don't schedule sessions in parallel

## 0.5.2

### Patch Changes

- f5eff91: clear timeouts on close

## 0.5.1

### Patch Changes

- 45a2f21: add ability to run HTML tests

## 0.5.0

### Minor Changes

- 1d277e9: rename framework to browser-lib

## 0.4.0

### Minor Changes

- ccb63df: @web/test-runner-dev-server to @web/test-runner-server

## 0.3.0

### Minor Changes

- 0c83d7e: create separate coverage and coverageConfig options

## 0.2.6

### Patch Changes

- 4d0d854: write test coverage details

## 0.2.5

### Patch Changes

- 115442b: add readme, package tags and description

## 0.2.4

### Patch Changes

- 444ee32: support multiple browser launchers

## 0.2.3

### Patch Changes

- 5a88530: merge TestSession and TestSessionResult

## 0.2.2

### Patch Changes

- e30036b: remove console statement

## 0.2.1

### Patch Changes

- ce0798f: report opening debug browser

## 0.2.0

### Minor Changes

- 37eb13a: don't wait for browser to close

## 0.1.2

### Patch Changes

- 692bf8d: Export constants

## 0.1.1

### Patch Changes

- 7260dad: update build script

## 0.1.0

### Minor Changes

- 45c8e3d: First release
