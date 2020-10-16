# @web/dev-server-esbuild

## 0.2.6

### Patch Changes

- 46a01fb: filter unsupported sourcemap warnings

## 0.2.5

### Patch Changes

- 8111c2f: upgrade mdn-browser-compat-data to @mdn/browser-compat-data
- 201ffbd: updated esbuild dependency

## 0.2.4

### Patch Changes

- be76d89: exposed strict option for esbuild

## 0.2.3

### Patch Changes

- dc2d689: added esbuild auto and auto-always flags
- bb53e68: add support for JSON loader

## 0.2.2

### Patch Changes

- ce2a2e6: align dependencies

## 0.2.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/dev-server-core@0.2.1

## 0.2.0

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

- 62ff8b2: make tests work on windows
- Updated dependencies [96dd279]
- Updated dependencies [62ff8b2]
- Updated dependencies [9be1f95]
  - @web/dev-server-core@0.2.0

## 0.1.5

### Patch Changes

- 5a33916: support .js extensions in TS imports

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
