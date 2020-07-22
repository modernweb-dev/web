# @web/dev-server-esbuild

## 0.1.4

### Patch Changes

- 38a8505: improve esbuild syntax error logging
- Updated dependencies [8596276]
  - @web/dev-server-core@0.1.5

## 0.1.3

### Patch Changes

- 8b94b03: update to esbuild 0.6.x

## 0.1.2

### Patch Changes

- 339722c: don't compile class fields when transforming ts

## 0.1.1

### Patch Changes

- 89214f0: update to latest esbuild
- Updated dependencies [59d3efe]
  - @web/dev-server-core@0.1.1

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

## 0.0.5

### Patch Changes

- 5da18d7: compile class fields strictly
- d1cc35c: set transform cache key
- Updated dependencies [9302247]
  - @web/dev-server-core@0.0.3

## 0.0.4

### Patch Changes

- a4d32b3: add auto compatibility mode

## 0.0.3

### Patch Changes

- 271ef35: allow setting loader for file extension

## 0.0.2

### Patch Changes

- bffc09b: fix package json main

## 0.0.1

### Patch Changes

- 52803c0: add esbuild plugin
