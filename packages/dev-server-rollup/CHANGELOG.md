# @web/dev-server-rollup

## 0.1.1

### Patch Changes

- 1580c82: add getModuleInfo stub

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

### Patch Changes

- Updated dependencies [c4cb321]
  - @web/dev-server-core@0.1.0

## 0.0.2

### Patch Changes

- Updated dependencies [9302247]
  - @web/dev-server-core@0.0.3

## 0.0.1

### Patch Changes

- c5da67f: first setup
- Updated dependencies [c5da67f]
  - @web/dev-server-core@0.0.2
