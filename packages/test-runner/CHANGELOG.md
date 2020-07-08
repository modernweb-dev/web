# @web/test-runner

## 0.6.4

### Patch Changes

- 93dbfe5: remove minified test framework from stack trace
- Updated dependencies [93dbfe5]
  - @web/test-runner-cli@0.4.2

## 0.6.3

### Patch Changes

- 00c3fa2: add syntax export default from
- Updated dependencies [00c3fa2]
  - @web/test-runner-server@0.5.3

## 0.6.2

### Patch Changes

- 307dd02: improve failure message
- Updated dependencies [307dd02]
  - @web/test-runner-cli@0.4.1

## 0.6.1

### Patch Changes

- bfbc965: add missing dependency
- Updated dependencies [3523426]
  - @web/test-runner-server@0.5.1

## 0.6.0

### Minor Changes

- c4cb321: Use web dev server in test runner. This contains multiple breaking changes:

  - Browsers that don't support es modules are not supported for now. We will add this back later.
  - Most es-dev-server config options are no longer available. The only options that are kept are `plugins`, `middleware`, `nodeResolve` and `preserveSymlinks`.
  - Test runner config changes:
    - Dev server options are now available on the root level of the configuration file.
    - `nodeResolve` is no longer enabled by default. You can enable it with the `--node-resolve` flag or `nodeResolve` option.
    - `middlewares` option is now called `middleware`.
    - `testFrameworkImport` is now called `testFramework`.
    - `address` is now split into `protocol` and `hostname`.

### Patch Changes

- Updated dependencies [c4cb321]
  - @web/test-runner-chrome@0.5.0
  - @web/test-runner-cli@0.4.0
  - @web/test-runner-core@0.6.0
  - @web/test-runner-server@0.5.0

## 0.5.22

### Patch Changes

- 7acda96: browser cache files in non-watch mode
- Updated dependencies [7acda96]
  - @web/test-runner-server@0.4.6

## 0.5.21

### Patch Changes

- 7fbda3c: update mocha import

## 0.5.20

### Patch Changes

- f7c3e08: Create a separate config loader package
- Updated dependencies [f7c3e08]
  - @web/test-runner-cli@0.3.10

## 0.5.19

### Patch Changes

- 2804b98: cache test runner libs
- Updated dependencies [2804b98]
  - @web/test-runner-server@0.4.5

## 0.5.18

### Patch Changes

- 2f4ea46: resolve stack trace paths relative to the root dir
- Updated dependencies [2f4ea46]
  - @web/test-runner-cli@0.3.9

## 0.5.17

### Patch Changes

- 50d1036: reset request 404s on rerun
- Updated dependencies [50d1036]
  - @web/test-runner-core@0.5.7

## 0.5.16

### Patch Changes

- 14b7fae: handle errors in mocha hooks
- Updated dependencies [14b7fae]
  - @web/test-runner-chrome@0.4.4
  - @web/test-runner-cli@0.3.8
  - @web/test-runner-core@0.5.6
  - @web/test-runner-mocha@0.2.5

## 0.5.15

### Patch Changes

- 52803c0: add esbuild plugin
- Updated dependencies [52803c0]
  - @web/test-runner-server@0.4.4

## 0.5.14

### Patch Changes

- 4f54bd3: only remove server adress in stack trace
- Updated dependencies [4f54bd3]
  - @web/test-runner-cli@0.3.6

## 0.5.13

### Patch Changes

- 589ac94: use custom toString when logging objects

## 0.5.12

### Patch Changes

- f2bf9ae: first setup of browserstack
- Updated dependencies [f2bf9ae]
  - @web/test-runner-server@0.4.3

## 0.5.11

### Patch Changes

- 54e2737: serialize logged complex objects

## 0.5.10

### Patch Changes

- f356e4c: re-render progress bar on rerun
- Updated dependencies [f356e4c]
  - @web/test-runner-cli@0.3.5

## 0.5.9

### Patch Changes

- 56ed519: open browser windows sequentially in selenium
- Updated dependencies [56ed519]
  - @web/test-runner-chrome@0.4.3
  - @web/test-runner-core@0.5.5

## 0.5.8

### Patch Changes

- 1ed03f5: add mocha debug CSS from JS (for now)
- Updated dependencies [1ed03f5]
  - @web/test-runner-mocha@0.2.4

## 0.5.7

### Patch Changes

- fe3a850: don't override config defaults

## 0.5.6

### Patch Changes

- 9d64995: handle mocking fetch
- Updated dependencies [9d64995]
  - @web/test-runner-mocha@0.2.3

## 0.5.5

### Patch Changes

- ebfdfd2: add selenium browser launcher
- Updated dependencies [ebfdfd2]
  - @web/test-runner-core@0.5.4

## 0.5.4

### Patch Changes

- ea8d173: don't overide default root dir
- Updated dependencies [ea8d173]
  - @web/test-runner-mocha@0.2.2

## 0.5.3

### Patch Changes

- 3d3a375: update dependencies

## 0.5.2

### Patch Changes

- 45a2f21: add ability to run HTML tests
- Updated dependencies [45a2f21]
  - @web/test-runner-chrome@0.4.1
  - @web/test-runner-core@0.5.1
  - @web/test-runner-mocha@0.2.1
  - @web/test-runner-server@0.4.2

## 0.5.1

### Patch Changes

- 01fac81: always use a random port
- Updated dependencies [01fac81]
  - @web/test-runner-cli@0.3.2

## 0.5.0

### Minor Changes

- 1d277e9: rename framework to browser-lib

### Patch Changes

- Updated dependencies [1d277e9]
  - @web/test-runner-chrome@0.4.0
  - @web/test-runner-core@0.5.0
  - @web/test-runner-mocha@0.2.0
  - @web/test-runner-cli@0.3.1
  - @web/test-runner-server@0.4.1

## 0.4.0

### Minor Changes

- ccb63df: @web/test-runner-dev-server to @web/test-runner-server

### Patch Changes

- Updated dependencies [ccb63df]
  - @web/test-runner-chrome@0.3.0
  - @web/test-runner-cli@0.3.0
  - @web/test-runner-core@0.4.0
  - @web/test-runner-server@0.4.0

## 0.3.1

### Patch Changes

- 8a568d7: ignore favicon 404s
- Updated dependencies [8a568d7]
  - @web/test-runner-dev-server@0.3.1

## 0.3.0

### Minor Changes

- 0c83d7e: create separate coverage and coverageConfig options

### Patch Changes

- Updated dependencies [0c83d7e]
  - @web/test-runner-cli@0.2.0
  - @web/test-runner-core@0.3.0
  - @web/test-runner-dev-server@0.3.0

## 0.2.12

### Patch Changes

- b1ff44a: don't log coverage in focus mode
- Updated dependencies [b1ff44a]
  - @web/test-runner-cli@0.1.12

## 0.2.11

### Patch Changes

- 7a7967f: handle non-object errors

## 0.2.10

### Patch Changes

- ed7b8db: add assets to published files
- Updated dependencies [ed7b8db]
  - @web/test-runner-mocha@0.1.2

## 0.2.9

### Patch Changes

- 61afea4: improve speed when test coverage is enabled
- Updated dependencies [61afea4]
  - @web/test-runner-dev-server@0.2.8

## 0.2.8

### Patch Changes

- 3d35527: fix config loading on node 10 and 12
- Updated dependencies [3d35527]
  - @web/test-runner-cli@0.1.11

## 0.2.7

### Patch Changes

- ccce5e1: add babel plugin
- Updated dependencies [ccce5e1]
  - @web/test-runner-dev-server@0.2.7

## 0.2.6

### Patch Changes

- 115442b: add readme, package tags and description
- Updated dependencies [115442b]
  - @web/test-runner-chrome@0.2.2
  - @web/test-runner-cli@0.1.8
  - @web/test-runner-core@0.2.5
  - @web/test-runner-dev-server@0.2.6
  - @web/test-runner-mocha@0.1.1

## 0.2.5

### Patch Changes

- 0e10aa4: Update dependencies

## 0.2.4

### Patch Changes

- f63ab90: allow configuring dev server from config
- Updated dependencies [f63ab90]
  - @web/test-runner-cli@0.1.6

## 0.2.3

### Patch Changes

- a0b2c81: add puppeteer and playwright flags

## 0.2.2

### Patch Changes

- 998dda8: add root dir and symlink flags
- Updated dependencies [df85d7e]
  - @web/test-runner-dev-server@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [79f9e6b]
  - @web/test-runner-chrome@0.2.0

## 0.2.0

### Minor Changes

- 6df4c3a: use @web/test-runner-chrome by default

### Patch Changes

- Updated dependencies [97e85e6]
- Updated dependencies [37eb13a]
  - @web/test-runner-chrome@0.1.0
  - @web/test-runner-core@0.2.0
  - @web/test-runner-cli@0.1.2
  - @web/test-runner-dev-server@0.2.1

## 0.1.0

### Minor Changes

- 42b4182: first setup

### Patch Changes

- Updated dependencies [42b4182]
  - @web/test-runner-cli@0.1.1
