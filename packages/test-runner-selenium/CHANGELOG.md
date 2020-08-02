# @web/test-runner-selenium

## 0.1.6

### Patch Changes

- 432f090: expose browser name from BrowserLauncher
- 5b36825: prevent debug sessions from interferring with regular test sessions

## 0.1.5

### Patch Changes

- 736d101: improve scheduling logic and error handling

## 0.1.4

### Patch Changes

- 5fada4a: improve logging and error reporting

## 0.1.3

### Patch Changes

- 04a2cda: make test-runner-browserstack work with dev-server-core

## 0.1.2

### Patch Changes

- c72ea22: allow configuring browser launch options

## 0.1.1

### Patch Changes

- 1d6d498: allow changing viewport in tests

## 0.1.0

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

## 0.0.4

### Patch Changes

- 14b7fae: handle errors in mocha hooks

## 0.0.3

### Patch Changes

- fbc1eba: don't run tests in parallel

## 0.0.2

### Patch Changes

- 56ed519: open browser windows sequentially in selenium

## 0.0.1

### Patch Changes

- ebfdfd2: add selenium browser launcher
