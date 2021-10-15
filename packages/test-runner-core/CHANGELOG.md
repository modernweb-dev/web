# @web/test-runner-core

## 0.10.22

### Patch Changes

- 64bd29ac: Corrected the typings for test-runner user config `testFramework` option

## 0.10.21

### Patch Changes

- d4f92e25: Replace uuid dependency with nanoid
- a09282b4: Replace chalk with nanocolors
- Updated dependencies [a09282b4]
  - @web/dev-server-core@0.3.16

## 0.10.20

### Patch Changes

- fcb8af58: Move Babel types to the correct package

## 0.10.19

### Patch Changes

- 73681b6d: Allow user config to be partial

## 0.10.18

### Patch Changes

- 51de0db1: fix(test-runner): fix error when merging multiple test-suites falsely reporting covered branches as uncovered

## 0.10.17

### Patch Changes

- 6f80be68: fix(test-runner): fix error when function metadata varies between tests, as seen in [https://github.com/modernweb-dev/web/issues/689](https://github.com/modernweb-dev/web/issues/689) and [https://github.com/istanbuljs/v8-to-istanbul/issues/121](https://github.com/istanbuljs/v8-to-istanbul/issues/121).

## 0.10.16

### Patch Changes

- e7efd5b7: use script origin to connect websocket
- Updated dependencies [e7efd5b7]
  - @web/dev-server-core@0.3.12

## 0.10.15

### Patch Changes

- 6c5893cc: use unescaped import specifier
- Updated dependencies [6c5893cc]
  - @web/dev-server-core@0.3.11

## 0.10.14

### Patch Changes

- ce90c7c3: Add the `sendKeys` command

  Sends a string of keys for the browser to press (all at once, as with single keys
  or shortcuts; e.g. `{press: 'Tab'}` or `{press: 'Shift+a'}` or
  `{press: 'Option+ArrowUp}`) or type (in sequence, e.g. `{type: 'Your name'}`) natively.

  For specific documentation of the strings to leverage here, see the Playwright documentation,
  here:

  - `press`: https://playwright.dev/docs/api/class-keyboard#keyboardpresskey-options
  - `type`: https://playwright.dev/docs/api/class-keyboard#keyboardtypetext-options

  Or, the Puppeter documentation, here:

  - `press`: https://pptr.dev/#?product=Puppeteer&show=api-keyboardpresskey-options
  - `type`: https://pptr.dev/#?product=Puppeteer&show=api-keyboardtypetext-options

  @param payload An object including a `press` or `type` property an the associated string
  for the browser runner to apply via that input method.

  @example

  ```ts
  await sendKeys({
    press: 'Tab',
  });
  ```

  @example

  ```ts
  await sendKeys({
    type: 'Your address',
  });
  ```

## 0.10.13

### Patch Changes

- b146365a: Add `buildCache` option to the visual regression config to support always saving the "current" screenshot.
  Make the `update` option in the visual regression config _strict_, and only save "current" shots as "baseline" when it is set to `true`.

## 0.10.12

### Patch Changes

- 826def7d: Move @types devDependencies to dependencies since user's TSC will also lint libs, therefore these types have to be installed for them.

## 0.10.11

### Patch Changes

- 83750cd2: fallback to fetch on IE11
- Updated dependencies [83750cd2]
- Updated dependencies [096fe25f]
  - @web/dev-server-core@0.3.6

## 0.10.10

### Patch Changes

- 2c223cf0: filter server stream errors
- Updated dependencies [2c223cf0]
  - @web/dev-server-core@0.3.5

## 0.10.9

### Patch Changes

- 3885b33e: configure timeout for fetching source maps for code coverage

## 0.10.8

### Patch Changes

- 83e0757e: handle cases when userAgent is not defined

## 0.10.7

### Patch Changes

- 6a62b4ee: filter out internal stack traces
- Updated dependencies [6a62b4ee]
  - @web/browser-logs@0.2.1

## 0.10.6

### Patch Changes

- 8861ded8: feat(dev-server-core): share websocket instances with iframe parent
- Updated dependencies [8861ded8]
  - @web/dev-server-core@0.3.4

## 0.10.5

### Patch Changes

- ad815710: fetch source map from server when generating code coverage reports. this fixes errors when using build tools that generate source maps on the fly, which don't exist on the file system
- c4738a40: support non-inline source maps for stack traces

## 0.10.4

### Patch Changes

- 43bc451c: add configuration option reporters in coverageConfig to use various istanbul reporters
- fd831b54: fix manual testing HTML tests

## 0.10.3

### Patch Changes

- 8e3b1128: fix regression introduced in filterBrowserLogs function that flipped the return value. returning true now properly includes the logs
- d5a5f2bf: Add undeclared dependencies

## 0.10.2

### Patch Changes

- 66638204: deduplicate parallel source map requests

## 0.10.1

### Patch Changes

- 9f1a8a56: normalize test framework path in stack trace

## 0.10.0

### Minor Changes

- 1dd7cd0e: improve serialization of stack traces cross-browser

  this adds two breaking changes, which should not affect most users:

  - removed `userAgent` field from `TestSession`
  - test reporter `reportTestFileResults` is no longer async

- a7d74fdc: drop support for node v10 and v11

### Patch Changes

- Updated dependencies [1dd7cd0e]
- Updated dependencies [1dd7cd0e]
  - @web/dev-server-core@0.3.3
  - @web/browser-logs@0.2.0

## 0.9.3

### Patch Changes

- f2a84204: reduce delay when clearing terminal between test runs

## 0.9.2

### Patch Changes

- af9811e2: regenerate MJS entrypoint

## 0.9.1

### Patch Changes

- eceb6295: match dotfiles when resolving mimetypes
- Updated dependencies [eceb6295]
  - @web/dev-server-core@0.3.1

## 0.9.0

### Minor Changes

- 6e313c18: merged @web/test-runner-cli package into @web/test-runner
- 0f613e0e: handle modules resolved outside root dir

### Patch Changes

- Updated dependencies [0f613e0e]
  - @web/dev-server-core@0.3.0

## 0.8.12

### Patch Changes

- 836abc0: handle errors thrown when (de)serializing browser logs
- Updated dependencies [836abc0]
- Updated dependencies [f6107a4]
  - @web/browser-logs@0.1.6

## 0.8.11

### Patch Changes

- 2278a95: bump dependencies

## 0.8.10

### Patch Changes

- 931fde9: clean up displayed test file path
- Updated dependencies [3b1a6cc]
  - @web/browser-logs@0.1.5

## 0.8.9

### Patch Changes

- 0f0d474: track manual test session imports

## 0.8.8

### Patch Changes

- 4bbaa21: use consistent paths on windows

## 0.8.7

### Patch Changes

- 145a8e6: correctly encode/decode test framework url

## 0.8.6

### Patch Changes

- 304558e: fix(test-runner): deduplicated browsers when reporting

## 0.8.5

### Patch Changes

- 4edf123: added option to configure test runner HTML per group
- cd8928b: separate reporting per browser launcher

## 0.8.4

### Patch Changes

- aadf0fe: Speed up test loading by inling test config and preloading test files.

## 0.8.3

### Patch Changes

- c256a08: allow configuring concurrency per browser launcher

## 0.8.2

### Patch Changes

- 859008b: added experimental mode to test workflows where tests on firefox require the browser window to be focused

## 0.8.1

### Patch Changes

- 175b124: fixed reporting multiple test files for a browser

## 0.8.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/dev-server-core@0.2.11

## 0.7.23

### Patch Changes

- 72ffcde: improve error message when no browsers are configured
- fcc2e28: added manual testing and open browser options

## 0.7.22

### Patch Changes

- bd27fff: improve browser and proxy close logic

## 0.7.21

### Patch Changes

- c8abc29: fix generating manual debug page

## 0.7.20

### Patch Changes

- d15ffee: serve iframe page with HTML content-type

## 0.7.19

### Patch Changes

- 88cc7ac: Reworked concurrent scheduling logic

  When running tests in multiple browsers, the browsers are no longer all started in parallel. Instead a new `concurrentBrowsers` property controls how many browsers are run concurrently. This helps improve speed and stability.

## 0.7.18

### Patch Changes

- 34efaad: added support for config groups

## 0.7.17

### Patch Changes

- 4ac0b3a: added experimental iframes mode to test improve speed when testing with selenium

## 0.7.16

### Patch Changes

- 534e92c: added the ability to transform test file imports

## 0.7.15

### Patch Changes

- cde5d29: add browser logging for all browser launchers
- cde5d29: add filterBrowserLogs option

## 0.7.14

### Patch Changes

- 3c72bdd: fixed serving test files outside cwd

## 0.7.13

### Patch Changes

- ab97aa8: publish browser folder

## 0.7.12

### Patch Changes

- 123c0c0: don't serve compressed files
- Updated dependencies [123c0c0]
  - @web/dev-server-core@0.2.9

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
