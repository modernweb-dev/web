# @web/test-runner

## 0.9.13

### Patch Changes

- db298f0: make saucelabs a dev dependency

## 0.9.12

### Patch Changes

- 13993fa: avoid under 1 concurrency
- Updated dependencies [13993fa]
  - @web/test-runner-cli@0.6.13

## 0.9.11

### Patch Changes

- 0614acf: update v8-to-istanbul
- Updated dependencies [2278a95]
  - @web/test-runner-chrome@0.7.3
  - @web/test-runner-cli@0.6.12
  - @web/test-runner-core@0.8.11

## 0.9.10

### Patch Changes

- 8da3fe0: add debug option
- Updated dependencies [8da3fe0]
  - @web/test-runner-cli@0.6.11

## 0.9.9

### Patch Changes

- 0f0d474: track manual test session imports
- Updated dependencies [0f0d474]
  - @web/test-runner-cli@0.6.10
  - @web/test-runner-core@0.8.9

## 0.9.8

### Patch Changes

- 4bbaa21: use consistent paths on windows
- Updated dependencies [4bbaa21]
  - @web/test-runner-core@0.8.8

## 0.9.7

### Patch Changes

- 382affc: don't require files to exist on disk for coverage
- Updated dependencies [a70da8d]
  - @web/test-runner-cli@0.6.9

## 0.9.6

### Patch Changes

- e21a4cf: add coverage failure per type when below threshold
- Updated dependencies [e21a4cf]
  - @web/test-runner-cli@0.6.8

## 0.9.5

### Patch Changes

- 145a8e6: correctly encode/decode test framework url
- Updated dependencies [145a8e6]
  - @web/test-runner-core@0.8.7
  - @web/test-runner-cli@0.6.7

## 0.9.4

### Patch Changes

- 49fba90: run user plugins after builtin plugins

## 0.9.3

### Patch Changes

- 304558e: fix(test-runner): deduplicated browsers when reporting
- Updated dependencies [304558e]
  - @web/test-runner-cli@0.6.6
  - @web/test-runner-core@0.8.6

## 0.9.2

### Patch Changes

- 4edf123: added option to configure test runner HTML per group
- cd8928b: separate reporting per browser launcher
- Updated dependencies [4edf123]
- Updated dependencies [cd8928b]
  - @web/test-runner-core@0.8.5
  - @web/test-runner-cli@0.6.5

## 0.9.1

### Patch Changes

- aadf0fe: Speed up test loading by inling test config and preloading test files.
- Updated dependencies [416c0d2]
- Updated dependencies [aadf0fe]
  - @web/test-runner-chrome@0.7.2
  - @web/test-runner-cli@0.6.4
  - @web/test-runner-commands@0.2.1
  - @web/test-runner-saucelabs@0.1.1
  - @web/test-runner-core@0.8.4
  - @web/test-runner-mocha@0.5.1

## 0.9.0

### Minor Changes

- b397a4c: Disabled the in-browser reporter during regular test runs, improving performance.

  Defaulted to the spec reporter instead of the HTML reporter in the browser when debugging. This avoids manipulating the testing environment by default.

  You can opt back into the old behavior by setting the mocha config:

  ```js
  export default {
    testFramework: {
      config: { reporter: 'html' },
    },
  };
  ```

### Patch Changes

- Updated dependencies [b397a4c]
  - @web/test-runner-mocha@0.5.0

## 0.8.5

### Patch Changes

- c256a08: allow configuring concurrency per browser launcher
- Updated dependencies [c256a08]
  - @web/test-runner-cli@0.6.3
  - @web/test-runner-chrome@0.7.1
  - @web/test-runner-core@0.8.3

## 0.8.4

### Patch Changes

- 859008b: added experimental mode to test workflows where tests on firefox require the browser window to be focused
- Updated dependencies [859008b]
  - @web/test-runner-core@0.8.2

## 0.8.3

### Patch Changes

- 0b5cc82: always print stack traces in errors
- Updated dependencies [0b5cc82]
  - @web/test-runner-cli@0.6.2

## 0.8.2

### Patch Changes

- 175b124: fixed reporting multiple test files for a browser
- 7ec6e94: don't require files option when using groups
- 438176c: Allow specifying default test group
- Updated dependencies [175b124]
- Updated dependencies [7ec6e94]
- Updated dependencies [438176c]
  - @web/test-runner-core@0.8.1
  - @web/test-runner-cli@0.6.1

## 0.8.1

### Patch Changes

- Updated dependencies [80d5814]
  - @web/test-runner-mocha@0.4.0

## 0.8.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/test-runner-chrome@0.7.0
  - @web/test-runner-cli@0.6.0
  - @web/test-runner-commands@0.2.0
  - @web/test-runner-core@0.8.0
  - @web/test-runner-saucelabs@0.1.0

## 0.7.42

### Patch Changes

- f2d0bb2: avoid using document.baseURI in IE11
- Updated dependencies [f2d0bb2]
  - @web/test-runner-mocha@0.3.7

## 0.7.41

### Patch Changes

- ae056f5: throw when combining browsers config and flags

## 0.7.40

### Patch Changes

- 72ffcde: improve error message when no browsers are configured
- fcc2e28: added manual testing and open browser options
- Updated dependencies [72ffcde]
- Updated dependencies [fcc2e28]
  - @web/test-runner-core@0.7.23
  - @web/test-runner-cli@0.5.18

## 0.7.39

### Patch Changes

- bd27fff: improve browser and proxy close logic
- Updated dependencies [bd27fff]
  - @web/test-runner-core@0.7.22
  - @web/test-runner-saucelabs@0.0.9

## 0.7.38

### Patch Changes

- c8abc29: fix generating manual debug page
- Updated dependencies [c8abc29]
  - @web/test-runner-core@0.7.21

## 0.7.37

### Patch Changes

- 38d8f03: turn on selenium iframe mode by default
- Updated dependencies [38d8f03]
- Updated dependencies [38d8f03]
  - @web/test-runner-cli@0.5.17
  - @web/test-runner-saucelabs@0.0.8

## 0.7.36

### Patch Changes

- d15ffee: serve iframe page with HTML content-type
- Updated dependencies [d15ffee]
  - @web/test-runner-core@0.7.20

## 0.7.35

### Patch Changes

- f5d6086: improve iframe mode speed
- Updated dependencies [f5d6086]
  - @web/test-runner-saucelabs@0.0.7

## 0.7.34

### Patch Changes

- c723271: add port CLI flag
- Updated dependencies [c723271]
  - @web/test-runner-cli@0.5.16

## 0.7.33

### Patch Changes

- 88cc7ac: Reworked concurrent scheduling logic

  When running tests in multiple browsers, the browsers are no longer all started in parallel. Instead a new `concurrentBrowsers` property controls how many browsers are run concurrently. This helps improve speed and stability.

- Updated dependencies [88cc7ac]
  - @web/test-runner-chrome@0.6.8
  - @web/test-runner-cli@0.5.15
  - @web/test-runner-core@0.7.19
  - @web/test-runner-saucelabs@0.0.6

## 0.7.32

### Patch Changes

- 34efaad: added support for config groups
- Updated dependencies [34efaad]
  - @web/test-runner-cli@0.5.14
  - @web/test-runner-core@0.7.18

## 0.7.31

### Patch Changes

- 4ac0b3a: added experimental iframes mode to test improve speed when testing with selenium
- Updated dependencies [4ac0b3a]
  - @web/test-runner-core@0.7.17

## 0.7.30

### Patch Changes

- 534e92c: added the ability to transform test file imports
- Updated dependencies [534e92c]
  - @web/test-runner-core@0.7.16
  - @web/test-runner-cli@0.5.13

## 0.7.29

### Patch Changes

- 13001e2: bump versions

## 0.7.28

### Patch Changes

- cde5d29: add browser logging for all browser launchers
- cde5d29: add filterBrowserLogs option
- Updated dependencies [cde5d29]
- Updated dependencies [cde5d29]
  - @web/test-runner-chrome@0.6.7
  - @web/test-runner-core@0.7.15

## 0.7.27

### Patch Changes

- 6949d03: fix serving generated rollup chunks
- Updated dependencies [6949d03]
  - @web/dev-server-rollup@0.2.9

## 0.7.26

### Patch Changes

- 3d6004b: added rollup bundle plugin
- Updated dependencies [3d6004b]
  - @web/dev-server-rollup@0.2.8

## 0.7.25

### Patch Changes

- 3c72bdd: fixed serving test files outside cwd
- Updated dependencies [3c72bdd]
  - @web/test-runner-core@0.7.14

## 0.7.24

### Patch Changes

- 28007f1: allow unknown cli args
- 28007f1: allow custom command line args
- 89612d3: removed debug variable
- Updated dependencies [28007f1]
- Updated dependencies [28007f1]
- Updated dependencies [89612d3]
  - @web/test-runner-cli@0.5.11

## 0.7.23

### Patch Changes

- 123c0c0: don't serve compressed files
- Updated dependencies [123c0c0]
  - @web/test-runner-cli@0.5.10
  - @web/test-runner-core@0.7.12

## 0.7.22

### Patch Changes

- 5ba52dd: properly close server on exit
- Updated dependencies [985a784]
- Updated dependencies [5ba52dd]
  - @web/test-runner-cli@0.5.9
  - @web/test-runner-core@0.7.11

## 0.7.21

### Patch Changes

- be3c9ed: track and log page reloads
- 2802df6: handle cases where reloading the page creates an infinite loop
- Updated dependencies [be3c9ed]
- Updated dependencies [2802df6]
  - @web/test-runner-chrome@0.6.6
  - @web/test-runner-core@0.7.10

## 0.7.20

### Patch Changes

- 431ec8f: added support for manually debugging in a browser
- Updated dependencies [431ec8f]
- Updated dependencies [abf811f]
  - @web/test-runner-cli@0.5.8
  - @web/test-runner-core@0.7.9
  - @web/test-runner-commands@0.1.5

## 0.7.19

### Patch Changes

- 4de5259: also report syntax errors when not using the node-resolve flag

## 0.7.18

### Patch Changes

- 41d895f: capture native browser errors
- Updated dependencies [41d895f]
  - @web/test-runner-chrome@0.6.5

## 0.7.17

### Patch Changes

- 43cd03b: increased browser start timeout
- Updated dependencies [43cd03b]
  - @web/test-runner-cli@0.5.7
  - @web/test-runner-core@0.7.8

## 0.7.16

### Patch Changes

- b1306c9: fixed race condition caching headers
- Updated dependencies [b1306c9]
  - @web/test-runner-core@0.7.7

## 0.7.15

### Patch Changes

- ee8c8d1: improved handling of timeouts starting or stopping a page
- 6694af7: added esbuild-target flag
- Updated dependencies [ee8c8d1]
- Updated dependencies [e3e6b22]
- Updated dependencies [e83ac30]
  - @web/test-runner-core@0.7.6
  - @web/dev-server-rollup@0.2.5

## 0.7.14

### Patch Changes

- cd1213e: improved logging of resolving outside root dir
- Updated dependencies [cd1213e]
  - @web/dev-server-rollup@0.2.4
  - @web/test-runner-core@0.7.5

## 0.7.13

### Patch Changes

- 05f826e: add missing get-stream package

## 0.7.12

### Patch Changes

- 0cc6a82: expose a startTestRunner function
- Updated dependencies [0cc6a82]
  - @web/test-runner-cli@0.5.6

## 0.7.11

### Patch Changes

- 2ff6570: avoid using instanceOf check when checking for BufferedLogger
- Updated dependencies [2ff6570]
  - @web/test-runner-cli@0.5.5

## 0.7.10

### Patch Changes

- ce2a2e6: align dependencies
- Updated dependencies [ce2a2e6]
  - @web/dev-server-rollup@0.2.3
  - @web/test-runner-chrome@0.6.4
  - @web/test-runner-cli@0.5.4
  - @web/test-runner-commands@0.1.3

## 0.7.9

### Patch Changes

- 944aa88: fixed handling of circular references generated by serializing certain types, like functions and regexp
- Updated dependencies [bc1741d]
  - @web/test-runner-core@0.7.4

## 0.7.8

### Patch Changes

- 22c85b5: fix handle race condition when starting browser
- da80c1d: fixed collecting test coverage on chrome/puppeteer
- Updated dependencies [22c85b5]
- Updated dependencies [da80c1d]
  - @web/test-runner-chrome@0.6.3

## 0.7.7

### Patch Changes

- 60de9b5: improve handling of undefined and null in browser logs
- Updated dependencies [60de9b5]
- Updated dependencies [4d29bb4]
  - @web/test-runner-cli@0.5.3
  - @web/test-runner-chrome@0.6.2

## 0.7.6

### Patch Changes

- 74bbffe: implemented import maps plugin
- Updated dependencies [74bbffe]
  - @web/test-runner-core@0.7.3

## 0.7.5

### Patch Changes

- dfef174: adds a custom reporter for HTML tests, avoiding errors when debugging
- Updated dependencies [dfef174]
  - @web/test-runner-mocha@0.3.3

## 0.7.4

### Patch Changes

- a137493: improve HTML tests setup
- Updated dependencies [a137493]
  - @web/test-runner-mocha@0.3.2

## 0.7.3

### Patch Changes

- 7e6e633: Added a --help command
- Updated dependencies [7e6e633]
- Updated dependencies [519e6e2]
  - @web/test-runner-cli@0.5.2
  - @web/test-runner-commands@0.1.2

## 0.7.2

### Patch Changes

- b020eee: update dependencies

## 0.7.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/dev-server-rollup@0.2.1
  - @web/test-runner-chrome@0.6.1
  - @web/test-runner-cli@0.5.1
  - @web/test-runner-commands@0.1.1
  - @web/test-runner-core@0.7.1
  - @web/test-runner-mocha@0.3.1

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

- 3307aa8: update to mocha v8

### Patch Changes

- 62ff8b2: make tests work on windows
- Updated dependencies [cdddf68]
- Updated dependencies [fdcf2e5]
- Updated dependencies [62ff8b2]
- Updated dependencies [9be1f95]
- Updated dependencies [3307aa8]
  - @web/test-runner-chrome@0.6.0
  - @web/test-runner-core@0.7.0
  - @web/test-runner-cli@0.5.0
  - @web/test-runner-commands@0.1.0
  - @web/dev-server-rollup@0.2.0
  - @web/test-runner-mocha@0.3.0

## 0.6.65

### Patch Changes

- f924a9b: improve support for puppeteer firefox
- Updated dependencies [f924a9b]
  - @web/test-runner-chrome@0.5.21

## 0.6.64

### Patch Changes

- 8fb820b: add an easy way to change served mime types
- Updated dependencies [8fb820b]
  - @web/dev-server-rollup@0.1.9
  - @web/test-runner-server@0.5.16

## 0.6.63

### Patch Changes

- d77093b: allow code coverage instrumentation through JS
- Updated dependencies [d77093b]
  - @web/test-runner-chrome@0.5.20
  - @web/test-runner-cli@0.4.30
  - @web/test-runner-core@0.6.23

## 0.6.62

### Patch Changes

- f0fe1f0: update to playwright 1.3.x

## 0.6.61

### Patch Changes

- 74cc129: implement commands API
- Updated dependencies [02a3926]
- Updated dependencies [74cc129]
  - @web/test-runner-chrome@0.5.19
  - @web/test-runner-cli@0.4.29
  - @web/test-runner-core@0.6.22
  - @web/test-runner-server@0.5.15
  - @web/test-runner-commands@0.0.1
  - @web/test-runner-mocha@0.2.15

## 0.6.60

### Patch Changes

- cbdf3c7: chore: merge browser lib into test-runner-core
- Updated dependencies [cbdf3c7]
  - @web/test-runner-chrome@0.5.18
  - @web/test-runner-core@0.6.21
  - @web/test-runner-mocha@0.2.14

## 0.6.59

### Patch Changes

- 4112c2b: feat(config-loader): add jsdoc type checking
- Updated dependencies [4112c2b]
  - @web/test-runner-cli@0.4.28

## 0.6.58

### Patch Changes

- c7c7cc9: fix(dev-server-rollup): add missing parse5 dependency
- Updated dependencies [c7c7cc9]
  - @web/dev-server-rollup@0.1.8

## 0.6.57

### Patch Changes

- 1d975e3: improve repository build setup
- Updated dependencies [1d975e3]
  - @web/test-runner-mocha@0.2.13
  - @web/test-runner-server@0.5.14

## 0.6.56

### Patch Changes

- c6fb524: expose test suite hierarchy, passed tests and duration
- Updated dependencies [c6fb524]
  - @web/test-runner-cli@0.4.27
  - @web/test-runner-core@0.6.20
  - @web/test-runner-mocha@0.2.12

## 0.6.55

### Patch Changes

- 5b36825: prevent debug sessions from interferring with regular test sessions
- Updated dependencies [432f090]
- Updated dependencies [5b36825]
  - @web/test-runner-chrome@0.5.17
  - @web/test-runner-cli@0.4.26
  - @web/test-runner-core@0.6.19
  - @web/test-runner-server@0.5.13

## 0.6.54

### Patch Changes

- ae09789: improve CLI performance
- Updated dependencies [ae09789]
  - @web/test-runner-cli@0.4.25

## 0.6.53

### Patch Changes

- 736d101: improve scheduling logic and error handling
- Updated dependencies [736d101]
  - @web/test-runner-chrome@0.5.16
  - @web/test-runner-cli@0.4.24
  - @web/test-runner-core@0.6.18

## 0.6.52

### Patch Changes

- 4e3de03: fix a potential race condition when starting a new test
- Updated dependencies [4e3de03]
  - @web/test-runner-chrome@0.5.15

## 0.6.51

### Patch Changes

- 7c25ba4: guard against the logs script being unavailable
- Updated dependencies [7c25ba4]
  - @web/test-runner-chrome@0.5.14

## 0.6.50

### Patch Changes

- ad11e36: resolve coverage include/exclude patterns
  - @web/test-runner-chrome@0.5.13

## 0.6.49

### Patch Changes

- 9484e97: replace rollupAdapter with fromRollup
- Updated dependencies [556827f]
- Updated dependencies [9484e97]
- Updated dependencies [7741a51]
  - @web/dev-server-rollup@0.1.6

## 0.6.48

### Patch Changes

- 3757865: add more args to test reporter callbacks
- Updated dependencies [3757865]
  - @web/test-runner-cli@0.4.23
  - @web/test-runner-core@0.6.17

## 0.6.47

### Patch Changes

- 868d795: account for numbers in urls in stack traces
- c64fbe6: improve testing with HTML
- Updated dependencies [868d795]
- Updated dependencies [c64fbe6]
  - @web/test-runner-cli@0.4.22
  - @web/test-runner-mocha@0.2.11

## 0.6.46

### Patch Changes

- 5fada4a: improve logging and error reporting
- Updated dependencies [5fada4a]
  - @web/test-runner-chrome@0.5.12
  - @web/test-runner-cli@0.4.21
  - @web/test-runner-core@0.6.16
  - @web/test-runner-mocha@0.2.9
  - @web/test-runner-server@0.5.12

## 0.6.45

### Patch Changes

- 7a22269: allow customize browser page creation
- Updated dependencies [7a22269]
  - @web/test-runner-chrome@0.5.11

## 0.6.44

### Patch Changes

- 868f786: don't override user defined browser launchers

## 0.6.43

### Patch Changes

- 9712125: fix not watching files with syntax errors

## 0.6.42

### Patch Changes

- 6bc4381: handle windows paths in @web/dev-server-rolup
- 588a971: fix loading esm config on windows
- Updated dependencies [6bc4381]
  - @web/dev-server-rollup@0.1.5
  - @web/test-runner-cli@0.4.20

## 0.6.41

### Patch Changes

- 8d3f7df: fix handling of inline source maps
- 92bba60: feat(test-runner-cli): show source location for diff errors
- Updated dependencies [8d3f7df]
- Updated dependencies [92bba60]
  - @web/test-runner-cli@0.4.19

## 0.6.40

### Patch Changes

- c2b5d6c: dedupe syntax errors
- 8596276: move logger to test runner cli
- Updated dependencies [f9dfcd3]
- Updated dependencies [c2b5d6c]
- Updated dependencies [8596276]
  - @web/dev-server-rollup@0.1.3
  - @web/test-runner-cli@0.4.18
  - @web/test-runner-core@0.6.15
  - @web/test-runner-server@0.5.11

## 0.6.39

### Patch Changes

- 4ced29a: fix race condition which cleared terminal on debug
- 023cc3f: don't require selecting files when there is only one test file
- a409489: remove multiple browsers total progress
- 7db1da1: open debug in a larger browser window
- Updated dependencies [4ced29a]
- Updated dependencies [023cc3f]
- Updated dependencies [a409489]
- Updated dependencies [7db1da1]
  - @web/test-runner-cli@0.4.17
  - @web/test-runner-core@0.6.14
  - @web/test-runner-chrome@0.5.10

## 0.6.38

### Patch Changes

- e97d492: allow adding custom reporters
- Updated dependencies [e97d492]
  - @web/test-runner-cli@0.4.16
  - @web/test-runner-core@0.6.13

## 0.6.37

### Patch Changes

- 3478d90: reduce .ts file extension priority

## 0.6.36

### Patch Changes

- 27a91cc: allow configuring test framework options
- Updated dependencies [27a91cc]
  - @web/test-runner-cli@0.4.15
  - @web/test-runner-core@0.6.12
  - @web/test-runner-mocha@0.2.8
  - @web/test-runner-server@0.5.10

## 0.6.35

### Patch Changes

- f991708: encode source map url requests
- Updated dependencies [f991708]
  - @web/test-runner-core@0.6.11

## 0.6.34

### Patch Changes

- d8b5f9e: don't report test coverage if it is not enabled
- Updated dependencies [d8b5f9e]
  - @web/test-runner-cli@0.4.14

## 0.6.33

### Patch Changes

- 45741c7: improve test coverage logging
- Updated dependencies [45741c7]
  - @web/test-runner-cli@0.4.13

## 0.6.32

### Patch Changes

- 1ebbf4a: fix deep cloning causing slow coverage measurements
- Updated dependencies [1ebbf4a]
  - @web/test-runner-core@0.6.10

## 0.6.31

### Patch Changes

- db5baff: cleanup and sort dependencies
- Updated dependencies [db5baff]
  - @web/test-runner-cli@0.4.12
  - @web/test-runner-core@0.6.9
  - @web/test-runner-mocha@0.2.7
  - @web/test-runner-server@0.5.9
  - @web/test-runner-chrome@0.5.9

## 0.6.30

### Patch Changes

- cfa4738: remove puppeteer dependency
- Updated dependencies [cfa4738]
  - @web/test-runner-chrome@0.5.8

## 0.6.29

### Patch Changes

- 687089f: support source maps in error stack traces
- Updated dependencies [687089f]
  - @web/test-runner-cli@0.4.11
  - @web/test-runner-core@0.6.8

## 0.6.28

### Patch Changes

- c72ea22: allow configuring browser launch options
- Updated dependencies [c72ea22]
  - @web/test-runner-chrome@0.5.7
  - @web/test-runner-core@0.6.7

## 0.6.27

### Patch Changes

- 7c3b466: revert setting browser:true by default

## 0.6.26

### Patch Changes

- b34ec0c: Added web_modules and browser: true to the node resolve plugin

## 0.6.25

### Patch Changes

- 6bcf981: correctly map pages to browsers

## 0.6.24

### Patch Changes

- 4a6b9c2: make coverage work in watch mode
- Updated dependencies [4a6b9c2]
  - @web/test-runner-chrome@0.5.6
  - @web/test-runner-core@0.6.6

## 0.6.23

### Patch Changes

- c104663: run legacy plugin after resolving imports

## 0.6.22

### Patch Changes

- 2672e8a: expose isInlineScriptRequest function

## 0.6.21

### Patch Changes

- Updated dependencies [2a25595]
  - @web/dev-server-legacy@0.0.1

## 0.6.20

### Patch Changes

- 1d6d498: allow changing viewport in tests
- Updated dependencies [1d6d498]
  - @web/test-runner-chrome@0.5.5
  - @web/test-runner-core@0.6.5
  - @web/test-runner-helpers@0.0.1
  - @web/test-runner-server@0.5.8

## 0.6.19

### Patch Changes

- e3bcdb6: fix(test-runner-cli): improve stack message detection
- Updated dependencies [e3bcdb6]
  - @web/test-runner-cli@0.4.10

## 0.6.18

### Patch Changes

- afc3cc7: update dependencies
- Updated dependencies [afc3cc7]
  - @web/dev-server-rollup@0.1.2
  - @web/test-runner-chrome@0.5.4

## 0.6.17

### Patch Changes

- 2150a26: update dependencies

## 0.6.15

### Patch Changes

- 8b94b03: update to esbuild 0.6.x

## 0.6.14

### Patch Changes

- 5ab18d8: feat(test-runner-core): batch v8 test coverage
- Updated dependencies [5ab18d8]
  - @web/test-runner-chrome@0.5.2
  - @web/test-runner-core@0.6.4
  - @web/test-runner-server@0.5.7

## 0.6.13

### Patch Changes

- ed59f5f: log relative test file paths
- Updated dependencies [ed59f5f]
  - @web/test-runner-cli@0.4.8

## 0.6.12

### Patch Changes

- a6aad93: strip test session id from test file
- Updated dependencies [a6aad93]
  - @web/test-runner-cli@0.4.7

## 0.6.11

### Patch Changes

- a9603b5: fix merging v8 code coverage
- Updated dependencies [a9603b5]
  - @web/test-runner-core@0.6.3

## 0.6.10

### Patch Changes

- 7e773c0: remove incorrect dependency

## 0.6.9

### Patch Changes

- 3dab600: profile test coverage through v8/chromium
- Updated dependencies [3dab600]
  - @web/test-runner-chrome@0.5.1
  - @web/test-runner-cli@0.4.6
  - @web/test-runner-core@0.6.2
  - @web/test-runner-playwright@0.4.1
  - @web/test-runner-server@0.5.6

## 0.6.8

### Patch Changes

- afee22a: run test coverage after user plugins
- Updated dependencies [afee22a]
  - @web/test-runner-server@0.5.5

## 0.6.7

### Patch Changes

- ca0168d: move dependencies to the correct project
- Updated dependencies [ca0168d]
  - @web/test-runner-server@0.5.4

## 0.6.6

### Patch Changes

- d1e9bec: emit test run finished after session update
- a9aec33: don't overwrite use coverage config
- Updated dependencies [d1e9bec]
- Updated dependencies [a9aec33]
  - @web/test-runner-core@0.6.1
  - @web/test-runner-cli@0.4.4

## 0.6.5

### Patch Changes

- eaf714d: print pending files in blue
- Updated dependencies [eaf714d]
  - @web/test-runner-cli@0.4.3

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
