# @web/test-runner-mocha

## 0.5.1

### Patch Changes

- aadf0fe: Speed up test loading by inling test config and preloading test files.
- Updated dependencies [aadf0fe]
  - @web/test-runner-core@0.8.4

## 0.5.0

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

## 0.4.0

### Minor Changes

- 80d5814: release new version of test-runner-mocha

### Patch Changes

- Updated dependencies [80d5814]
  - @web/test-runner-mocha@0.4.0

## 0.3.7

### Patch Changes

- f2d0bb2: avoid using document.baseURI in IE11

## 0.3.6

### Patch Changes

- dbde3ba: track browser logs on all browser launchers

## 0.3.5

### Patch Changes

- b1ff412: mocha should be a dev dependency

## 0.3.4

### Patch Changes

- fe753a8: update to the latest core

## 0.3.3

### Patch Changes

- dfef174: adds a custom reporter for HTML tests, avoiding errors when debugging

## 0.3.2

### Patch Changes

- a137493: improve HTML tests setup

## 0.3.1

### Patch Changes

- aa65fd1: run build before publishing

## 0.3.0

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

- 3307aa8: update to mocha v8

## 0.2.15

### Patch Changes

- 74cc129: implement commands API

## 0.2.14

### Patch Changes

- cbdf3c7: chore: merge browser lib into test-runner-core

## 0.2.13

### Patch Changes

- 1d975e3: improve repository build setup
- Updated dependencies [1d975e3]
  - @web/test-runner-browser-lib@0.2.12

## 0.2.12

### Patch Changes

- c6fb524: expose test suite hierarchy, passed tests and duration
- Updated dependencies [c6fb524]
  - @web/test-runner-browser-lib@0.2.11

## 0.2.11

### Patch Changes

- c64fbe6: improve testing with HTML

## 0.2.10

### Patch Changes

- 837d5bc: only minify for production
- Updated dependencies [837d5bc]
  - @web/test-runner-browser-lib@0.2.10

## 0.2.9

### Patch Changes

- 5fada4a: improve logging and error reporting
- Updated dependencies [5fada4a]
  - @web/test-runner-browser-lib@0.2.9

## 0.2.8

### Patch Changes

- 27a91cc: allow configuring test framework options
- Updated dependencies [27a91cc]
  - @web/test-runner-browser-lib@0.2.8

## 0.2.7

### Patch Changes

- db5baff: cleanup and sort dependencies

## 0.2.6

### Patch Changes

- d1c095a: bundle browser libs
- Updated dependencies [d1c095a]
  - @web/test-runner-browser-lib@0.2.6

## 0.2.5

### Patch Changes

- 14b7fae: handle errors in mocha hooks
- Updated dependencies [14b7fae]
  - @web/test-runner-browser-lib@0.2.5

## 0.2.4

### Patch Changes

- 1ed03f5: add mocha debug CSS from JS (for now)

## 0.2.3

### Patch Changes

- 9d64995: handle mocking fetch
- Updated dependencies [9d64995]
  - @web/test-runner-browser-lib@0.2.2

## 0.2.2

### Patch Changes

- ea8d173: publish new files to NPM

## 0.2.1

### Patch Changes

- 45a2f21: add ability to run HTML tests
- Updated dependencies [45a2f21]
  - @web/test-runner-browser-lib@0.2.1

## 0.2.0

### Minor Changes

- 1d277e9: rename framework to browser-lib

### Patch Changes

- Updated dependencies [1d277e9]
  - @web/test-runner-browser-lib@0.2.0

## 0.1.2

### Patch Changes

- ed7b8db: add assets to published files

## 0.1.1

### Patch Changes

- 115442b: add readme, package tags and description
- Updated dependencies [115442b]
  - @web/test-runner-browser-lib@0.1.1

## 0.1.0

### Minor Changes

- 9c84a1b: first setup
