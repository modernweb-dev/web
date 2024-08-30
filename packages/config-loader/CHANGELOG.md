# @web/config-loader

## 0.3.2

### Patch Changes

- 3845d549: Set type to commonjs in package.json

## 0.3.1

### Patch Changes

- 5b6e1bcd: Drop support for older node runtimes (12 and earlier)

## 0.3.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

## 0.2.2

### Patch Changes

- 640ba85f: added types for main entry point

## 0.2.1

### Patch Changes

- c26d3730: Update TypeScript

## 0.2.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.

## 0.1.3

### Patch Changes

- 6e313c18: improve error message

## 0.1.2

### Patch Changes

- 132c43c: export map entry for import needs to be valid

## 0.1.1

### Patch Changes

- aa65fd1: run build before publishing

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

## 0.0.4

### Patch Changes

- 4112c2b: feat(config-loader): add jsdoc type checking

## 0.0.3

### Patch Changes

- 588a971: fix loading esm config on windows

## 0.0.2

### Patch Changes

- 095f80d: remove unneeded try catch

## 0.0.1

### Patch Changes

- f7c3e08: Create a separate config loader package
