# @web/dev-server-rollup

## 0.1.9

### Patch Changes

- 8fb820b: add an easy way to change served mime types
- Updated dependencies [8fb820b]
  - @web/dev-server-core@0.1.9

## 0.1.8

### Patch Changes

- c7c7cc9: fix(dev-server-rollup): add missing parse5 dependency

## 0.1.7

### Patch Changes

- fdbae14: only add root dir when necessary

## 0.1.6

### Patch Changes

- 556827f: add fromRollup function
- 9484e97: replace rollupAdapter with fromRollup
- 7741a51: don't skip absolute windows paths

## 0.1.5

### Patch Changes

- 6bc4381: handle windows paths in @web/dev-server-rolup

## 0.1.4

### Patch Changes

- 1c915d0: handle inline scripts

## 0.1.3

### Patch Changes

- f9dfcd3: improve rollup syntax error logging
- Updated dependencies [8596276]
  - @web/dev-server-core@0.1.5

## 0.1.2

### Patch Changes

- afc3cc7: update dependencies

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
