# @web/test-runner-cli

## 0.5.9

### Patch Changes

- 985a784: periodically print progress in a CI environment
- Updated dependencies [5ba52dd]
  - @web/test-runner-core@0.7.11

## 0.5.8

### Patch Changes

- 431ec8f: added support for manually debugging in a browser
- Updated dependencies [431ec8f]
  - @web/test-runner-core@0.7.9

## 0.5.7

### Patch Changes

- 43cd03b: increased browser start timeout
- Updated dependencies [43cd03b]
  - @web/test-runner-core@0.7.8

## 0.5.6

### Patch Changes

- 0cc6a82: add test options to startTestRunner

## 0.5.5

### Patch Changes

- 2ff6570: avoid using instanceOf check when checking for BufferedLogger

## 0.5.4

### Patch Changes

- ce2a2e6: align dependencies

## 0.5.3

### Patch Changes

- 60de9b5: improve handling of undefined and null in browser logs
- Updated dependencies [60de9b5]
  - @web/browser-logs@0.1.2

## 0.5.2

### Patch Changes

- 7e6e633: Added a --help command

## 0.5.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/browser-logs@0.1.1
  - @web/config-loader@0.1.1
  - @web/test-runner-core@0.7.1

## 0.5.0

### Minor Changes

- fdcf2e5: Merged test runner server into core, and made it no longer possible configure a different server.

  The test runner relies on the server for many things, merging it into core makes the code more maintainable. The server is composable, you can proxy requests to other servers and we can look into adding more composition APIs later.

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

- Updated dependencies [cdddf68]
- Updated dependencies [fdcf2e5]
- Updated dependencies [62ff8b2]
- Updated dependencies [9be1f95]
  - @web/test-runner-core@0.7.0
  - @web/browser-logs@0.1.0
  - @web/config-loader@0.1.0

## 0.4.30

### Patch Changes

- d77093b: allow code coverage instrumentation through JS
- Updated dependencies [d77093b]
  - @web/test-runner-core@0.6.23

## 0.4.29

### Patch Changes

- 02a3926: expose browser name from BrowserLauncher
- Updated dependencies [02a3926]
- Updated dependencies [74cc129]
  - @web/test-runner-core@0.6.22

## 0.4.28

### Patch Changes

- 4112c2b: feat(config-loader): add jsdoc type checking
- Updated dependencies [4112c2b]
  - @web/config-loader@0.0.4

## 0.4.27

### Patch Changes

- c6fb524: expose test suite hierarchy, passed tests and duration
- Updated dependencies [c6fb524]
  - @web/test-runner-core@0.6.20

## 0.4.26

### Patch Changes

- 432f090: expose browser name from BrowserLauncher
- 5b36825: prevent debug sessions from interferring with regular test sessions
- Updated dependencies [432f090]
- Updated dependencies [5b36825]
  - @web/test-runner-core@0.6.19

## 0.4.25

### Patch Changes

- ae09789: improve CLI performance

## 0.4.24

### Patch Changes

- 736d101: improve scheduling logic and error handling
- Updated dependencies [736d101]
  - @web/test-runner-core@0.6.18

## 0.4.23

### Patch Changes

- 3757865: add more args to test reporter callbacks
- Updated dependencies [3757865]
  - @web/test-runner-core@0.6.17

## 0.4.22

### Patch Changes

- 868d795: account for numbers in urls in stack traces

## 0.4.21

### Patch Changes

- 5fada4a: improve logging and error reporting
- Updated dependencies [5fada4a]
  - @web/browser-logs@0.0.1
  - @web/test-runner-core@0.6.16

## 0.4.20

### Patch Changes

- Updated dependencies [588a971]
  - @web/config-loader@0.0.3

## 0.4.19

### Patch Changes

- 8d3f7df: fix handling of inline source maps
- 92bba60: feat(test-runner-cli): show source location for diff errors

## 0.4.18

### Patch Changes

- c2b5d6c: dedupe syntax errors
- 8596276: move logger to test runner cli
- Updated dependencies [8596276]
  - @web/test-runner-core@0.6.15

## 0.4.17

### Patch Changes

- 4ced29a: fix race condition which cleared terminal on debug
- 023cc3f: don't require selecting files when there is only one test file
- a409489: remove multiple browsers total progress
- Updated dependencies [023cc3f]
  - @web/test-runner-core@0.6.14

## 0.4.16

### Patch Changes

- e97d492: allow adding custom reporters
- Updated dependencies [e97d492]
  - @web/test-runner-core@0.6.13

## 0.4.15

### Patch Changes

- 27a91cc: allow configuring test framework options
- Updated dependencies [27a91cc]
  - @web/test-runner-core@0.6.12

## 0.4.14

### Patch Changes

- d8b5f9e: don't report test coverage if it is not enabled

## 0.4.13

### Patch Changes

- 45741c7: improve test coverage logging

## 0.4.12

### Patch Changes

- db5baff: cleanup and sort dependencies
- Updated dependencies [db5baff]
  - @web/test-runner-core@0.6.9

## 0.4.11

### Patch Changes

- 687089f: support source maps in error stack traces
- Updated dependencies [687089f]
  - @web/test-runner-core@0.6.8

## 0.4.10

### Patch Changes

- e3bcdb6: fix(test-runner-cli): improve stack message detection

## 0.4.9

### Patch Changes

- 835b30c: update dependencies

## 0.4.8

### Patch Changes

- ed59f5f: log relative test file paths

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
