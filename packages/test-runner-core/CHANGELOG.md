# @web/test-runner-core

## 0.7.11

### Patch Changes

- 5ba52dd: properly close server on exit
- Updated dependencies [5ba52dd]
- Updated dependencies [8199b68]
  - @web/dev-server-core@0.2.8

## 0.7.10

### Patch Changes

- be3c9ed: track and log page reloads

## 0.7.9

### Patch Changes

- 431ec8f: added support for manually debugging in a browser

## 0.7.8

### Patch Changes

- 43cd03b: increased browser start timeout

## 0.7.7

### Patch Changes

- b1306c9: fixed race condition caching headers
- Updated dependencies [b1306c9]
  - @web/dev-server-core@0.2.7

## 0.7.6

### Patch Changes

- ee8c8d1: improved handling of timeouts starting or stopping a page
- e3e6b22: removed usage of deepmerge

## 0.7.5

### Patch Changes

- cd1213e: improved logging of resolving outside root dir
- Updated dependencies [cd1213e]
  - @web/dev-server-core@0.2.6

## 0.7.4

### Patch Changes

- bc1741d: expose getHtmlPath function
- Updated dependencies [bc1741d]
  - @web/dev-server-core@0.2.2

## 0.7.3

### Patch Changes

- 74bbffe: implemented import maps plugin

## 0.7.2

### Patch Changes

- 5f26788: add packages from test-runner-server
- Updated dependencies [5f26788]
  - @web/test-runner-core@0.7.2

## 0.7.1

### Patch Changes

- aa65fd1: run build before publishing

## 0.7.0

### Minor Changes

- cdddf68: Removed support for `@web/test-runner-helpers`. This is a breaking change, the functionality is now available in `@web/test-runner-commands`.
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

- 62ff8b2: make tests work on windows

## 0.6.23

### Patch Changes

- d77093b: allow code coverage instrumentation through JS

## 0.6.22

### Patch Changes

- 02a3926: expose browser name from BrowserLauncher
- 74cc129: implement commands API

## 0.6.21

### Patch Changes

- cbdf3c7: chore: merge browser lib into test-runner-core

## 0.6.20

### Patch Changes

- c6fb524: expose test suite hierarchy, passed tests and duration

## 0.6.19

### Patch Changes

- 432f090: expose browser name from BrowserLauncher
- 5b36825: prevent debug sessions from interferring with regular test sessions

## 0.6.18

### Patch Changes

- 736d101: improve scheduling logic and error handling

## 0.6.17

### Patch Changes

- 3757865: add more args to test reporter callbacks

## 0.6.16

### Patch Changes

- 5fada4a: improve logging and error reporting

## 0.6.15

### Patch Changes

- 8596276: move logger to test runner cli

## 0.6.14

### Patch Changes

- 023cc3f: don't require selecting files when there is only one test file

## 0.6.13

### Patch Changes

- e97d492: allow adding custom reporters

## 0.6.12

### Patch Changes

- 27a91cc: allow configuring test framework options

## 0.6.11

### Patch Changes

- f991708: encode source map url requests

## 0.6.10

### Patch Changes

- 1ebbf4a: fix deep cloning causing slow coverage measurements

## 0.6.9

### Patch Changes

- db5baff: cleanup and sort dependencies

## 0.6.8

### Patch Changes

- 687089f: support source maps in error stack traces

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
