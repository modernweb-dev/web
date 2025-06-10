# @web/dev-server-legacy

## 2.1.1

### Patch Changes

- fix: update @web/dev-server-core

## 2.1.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/polyfills-loader@2.2.0
  - @web/dev-server-core@0.7.0

## 2.0.3

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/polyfills-loader@2.1.3
  - @web/dev-server-core@0.6.2

## 2.0.2

### Patch Changes

- Updated dependencies [7f0f4315]
  - @web/dev-server-core@0.6.0

## 2.0.1

### Patch Changes

- 7bb523fa: Update various dependencies

## 2.0.0

### Major Changes

- febd9d9d: Set node 16 as the minimum version.

### Patch Changes

- Updated dependencies [ca715faf]
- Updated dependencies [febd9d9d]
  - @web/dev-server-core@0.5.0
  - @web/polyfills-loader@2.0.0

## 1.0.3

### Patch Changes

- 817d674b: Update `browserslist-useragent`
- Updated dependencies [c103f166]
  - @web/dev-server-core@0.4.1

## 1.0.2

### Patch Changes

- Updated dependencies [ac05ca5d]
- Updated dependencies [acc0a84c]
- Updated dependencies [81db401b]
  - @web/dev-server-core@0.4.0

## 1.0.1

### Patch Changes

- 00da4255: Update es-module-lexer to 1.0.0
- Updated dependencies [00da4255]
  - @web/dev-server-core@0.3.19

## 1.0.0

### Major Changes

- 9b0b7a91: Migrate to @web/polyfills-loader

### Patch Changes

- Updated dependencies [16f33e3e]
- Updated dependencies [283c9258]
- Updated dependencies [642d5253]
  - @web/polyfills-loader@1.3.2

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
