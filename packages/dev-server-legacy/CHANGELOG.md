# @web/dev-server-legacy

## 0.1.7

### Patch Changes

- Updated dependencies [0f613e0e]
  - @web/dev-server-core@0.3.0

## 0.1.6

### Patch Changes

- 7aabb52: only transform modules to systemjs
- Updated dependencies [e8ebfcc]
  - @web/dev-server-core@0.2.13

## 0.1.5

### Patch Changes

- 7901081: Include URL parameters in inline scripts cache

## 0.1.4

### Patch Changes

- 71348e2: make polyfills configurable

## 0.1.3

### Patch Changes

- abf42a3: fixed incorrect source filename when transforming inline scripts with babel

## 0.1.2

### Patch Changes

- ce2a2e6: align dependencies

## 0.1.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/dev-server-core@0.2.1

## 0.1.0

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

- Updated dependencies [96dd279]
- Updated dependencies [62ff8b2]
- Updated dependencies [9be1f95]
  - @web/dev-server-core@0.2.0

## 0.0.3

### Patch Changes

- 5fada4a: improve logging and error reporting

## 0.0.2

### Patch Changes

- db5baff: cleanup and sort dependencies
- Updated dependencies [db5baff]
  - @web/dev-server-core@0.1.4

## 0.0.1

### Patch Changes

- 2a25595: first release
