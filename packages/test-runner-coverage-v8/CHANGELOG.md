# @web/test-runner-coverage-v8

## 0.1.3

### Patch Changes

- 611bb0f: updated to v8-to-istanbul v5

## 0.1.2

### Patch Changes

- ce2a2e6: align dependencies

## 0.1.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/test-runner-core@0.7.1

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

- Updated dependencies [cdddf68]
- Updated dependencies [fdcf2e5]
- Updated dependencies [62ff8b2]
- Updated dependencies [9be1f95]
  - @web/test-runner-core@0.7.0

## 0.0.4

### Patch Changes

- ad11e36: resolve coverage include/exclude patterns

## 0.0.3

### Patch Changes

- db5baff: cleanup and sort dependencies
- Updated dependencies [db5baff]
  - @web/test-runner-core@0.6.9

## 0.0.2

### Patch Changes

- 835b30c: update dependencies

## 0.0.1

### Patch Changes

- 3dab600: profile test coverage through v8/chromium
- Updated dependencies [3dab600]
  - @web/test-runner-core@0.6.2
