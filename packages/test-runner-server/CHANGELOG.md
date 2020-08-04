# @web/test-runner-server

## 0.5.14

### Patch Changes

- 1d975e3: improve repository build setup

## 0.5.13

### Patch Changes

- 432f090: expose browser name from BrowserLauncher
- 5b36825: prevent debug sessions from interferring with regular test sessions
- Updated dependencies [432f090]
- Updated dependencies [5b36825]
  - @web/test-runner-core@0.6.19

## 0.5.12

### Patch Changes

- 5fada4a: improve logging and error reporting
- Updated dependencies [5fada4a]
  - @web/test-runner-core@0.6.16

## 0.5.11

### Patch Changes

- 8596276: move logger to test runner cli
- Updated dependencies [8596276]
  - @web/dev-server-core@0.1.5
  - @web/test-runner-core@0.6.15

## 0.5.10

### Patch Changes

- 27a91cc: allow configuring test framework options
- Updated dependencies [27a91cc]
  - @web/test-runner-core@0.6.12

## 0.5.9

### Patch Changes

- db5baff: cleanup and sort dependencies
- Updated dependencies [db5baff]
  - @web/dev-server-core@0.1.4
  - @web/test-runner-core@0.6.9

## 0.5.8

### Patch Changes

- 1d6d498: allow changing viewport in tests
- Updated dependencies [1d6d498]
  - @web/test-runner-core@0.6.5

## 0.5.7

### Patch Changes

- 5ab18d8: feat(test-runner-core): batch v8 test coverage
- Updated dependencies [5ab18d8]
  - @web/test-runner-core@0.6.4

## 0.5.6

### Patch Changes

- 3dab600: profile test coverage through v8/chromium
- Updated dependencies [3dab600]
  - @web/test-runner-core@0.6.2

## 0.5.5

### Patch Changes

- afee22a: run test coverage after user plugins

## 0.5.4

### Patch Changes

- ca0168d: move dependencies to the correct project
- Updated dependencies [59d3efe]
  - @web/dev-server-core@0.1.1

## 0.5.3

### Patch Changes

- 00c3fa2: add syntax export default from

## 0.5.2

### Patch Changes

- 3cdb338: don't run test coverage on test framework
- 4f72c90: add babel syntax plugins

## 0.5.1

### Patch Changes

- 3523426: add missing dependency

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

### Patch Changes

- Updated dependencies [c4cb321]
  - @web/dev-server-core@0.1.0
  - @web/test-runner-core@0.6.0

## 0.4.6

### Patch Changes

- 7acda96: browser cache files in non-watch mode

## 0.4.5

### Patch Changes

- 2804b98: cache test runner libs

## 0.4.4

### Patch Changes

- 52803c0: add esbuild plugin

## 0.4.3

### Patch Changes

- f2bf9ae: first setup of browserstack

## 0.4.2

### Patch Changes

- 45a2f21: add ability to run HTML tests
- Updated dependencies [45a2f21]
  - @web/test-runner-core@0.5.1

## 0.4.1

### Patch Changes

- Updated dependencies [1d277e9]
  - @web/test-runner-core@0.5.0

## 0.4.0

### Minor Changes

- ccb63df: @web/test-runner-dev-server to @web/test-runner-server

### Patch Changes

- Updated dependencies [ccb63df]
  - @web/test-runner-core@0.4.0

## 0.3.1

### Patch Changes

- 8a568d7: ignore favicon 404s

## 0.3.0

### Minor Changes

- 0c83d7e: create separate coverage and coverageConfig options

### Patch Changes

- Updated dependencies [0c83d7e]
  - @web/test-runner-core@0.3.0

## 0.2.8

### Patch Changes

- 61afea4: improve speed when test coverage is enabled

## 0.2.7

### Patch Changes

- ccce5e1: add babel plugin

## 0.2.6

### Patch Changes

- 115442b: add readme, package tags and description
- Updated dependencies [115442b]
  - @web/test-runner-core@0.2.5

## 0.2.5

### Patch Changes

- 4ebbe8a: Rerun all sessions when an unknown file changes

## 0.2.4

### Patch Changes

- 41489f6: log 404s also when session times out

## 0.2.3

### Patch Changes

- 5a88530: merge TestSession and TestSessionResult
- Updated dependencies [5a88530]
  - @web/test-runner-core@0.2.3

## 0.2.2

### Patch Changes

- df85d7e: resolve file path relative to root dir

## 0.2.1

### Patch Changes

- Updated dependencies [37eb13a]
  - @web/test-runner-core@0.2.0

## 0.2.0

### Minor Changes

- 692bf8d: first setup

### Patch Changes

- Updated dependencies [692bf8d]
  - @web/test-runner-core@0.1.2
