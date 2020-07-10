# @web/test-runner-cli

## 0.4.7

### Patch Changes

- a6aad93: strip test session id from test file

## 0.4.6

### Patch Changes

- 3dab600: profile test coverage through v8/chromium
- Updated dependencies [3dab600]
  - @web/test-runner-core@0.6.2

## 0.4.5

### Patch Changes

- Updated dependencies [095f80d]
  - @web/config-loader@0.0.2

## 0.4.4

### Patch Changes

- a9aec33: don't overwrite use coverage config
- Updated dependencies [d1e9bec]
  - @web/test-runner-core@0.6.1

## 0.4.3

### Patch Changes

- eaf714d: print pending files in blue

## 0.4.2

### Patch Changes

- 93dbfe5: remove minified test framework from stack trace

## 0.4.1

### Patch Changes

- 307dd02: improve failure message

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

## 0.3.10

### Patch Changes

- f7c3e08: Create a separate config loader package
- Updated dependencies [f7c3e08]
  - @web/config-loader@0.0.1

## 0.3.9

### Patch Changes

- 2f4ea46: resolve stack trace paths relative to the root dir

## 0.3.8

### Patch Changes

- 14b7fae: handle errors in mocha hooks
- Updated dependencies [14b7fae]
  - @web/test-runner-core@0.5.6

## 0.3.7

### Patch Changes

- d8475e5: validate config now accepts a string for as files field

## 0.3.6

### Patch Changes

- 4f54bd3: only remove server adress in stack trace

## 0.3.5

### Patch Changes

- f356e4c: re-render progress bar on rerun

## 0.3.4

### Patch Changes

- c6d2cc5: set default rootDir

## 0.3.3

### Patch Changes

- 07b4aa0: fix reading config from CLI arg

## 0.3.2

### Patch Changes

- 01fac81: always use a random port

## 0.3.1

### Patch Changes

- Updated dependencies [1d277e9]
  - @web/test-runner-core@0.5.0

## 0.3.0

### Minor Changes

- ccb63df: @web/test-runner-dev-server to @web/test-runner-server

### Patch Changes

- Updated dependencies [ccb63df]
  - @web/test-runner-core@0.4.0

## 0.2.0

### Minor Changes

- 0c83d7e: create separate coverage and coverageConfig options

### Patch Changes

- Updated dependencies [0c83d7e]
  - @web/test-runner-core@0.3.0

## 0.1.12

### Patch Changes

- b1ff44a: don't log coverage in focus mode

## 0.1.11

### Patch Changes

- 3d35527: fix config loading on node 10 and 12

## 0.1.10

### Patch Changes

- 44acd58: don't throw when there is no config in node 10

## 0.1.9

### Patch Changes

- 4d0d854: write test coverage details
- Updated dependencies [4d0d854]
  - @web/test-runner-core@0.2.6

## 0.1.8

### Patch Changes

- 115442b: add readme, package tags and description
- Updated dependencies [115442b]
  - @web/test-runner-core@0.2.5

## 0.1.7

### Patch Changes

- 3467256: add js directory to publish config

## 0.1.6

### Patch Changes

- f63ab90: allow configuring dev server from config

## 0.1.5

### Patch Changes

- 5a88530: merge TestSession and TestSessionResult
- Updated dependencies [5a88530]
  - @web/test-runner-core@0.2.3

## 0.1.4

### Patch Changes

- 988c93c: don't report sessions that never started as succesful
- Updated dependencies [e30036b]
  - @web/test-runner-core@0.2.2

## 0.1.3

### Patch Changes

- ce0798f: report opening debug browser
- Updated dependencies [ce0798f]
  - @web/test-runner-core@0.2.1

## 0.1.2

### Patch Changes

- Updated dependencies [37eb13a]
  - @web/test-runner-core@0.2.0

## 0.1.1

### Patch Changes

- 42b4182: fix typeof check and exit process on quit

## 0.1.0

### Minor Changes

- f1613cf: First release

### Patch Changes

- 7d339fe: version bump to test the CI
- Updated dependencies [7260dad]
  - @web/test-runner-core@0.1.1
