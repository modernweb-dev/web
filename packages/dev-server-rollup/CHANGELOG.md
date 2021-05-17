# @web/dev-server-rollup

## 0.3.4

### Patch Changes

- c41fba24: Support for subpath imports

  👉 `my-pkg/package.json`

  ```json
  {
    "name": "my-pkg",
    "imports": {
      "#internal-a": "./path/to/internal-a.js"
    }
  }
  ```

  👉 `my-pkg/src/file.js`

  ```js
  import { private } from '#internal-a';
  ```

  Subpath imports are not available to users of your package

  👉 `other-pkg/src/file.js`

  ```js
  // both will fail
  import { private } from 'my-pkg#internal-a';
  import { private } from 'my-pkg/path/to/internal-a.js';
  ```

## 0.3.3

### Patch Changes

- 0a05464b: do not resolve multiple times outside root files

## 0.3.2

### Patch Changes

- 5d36f239: allow resolving extensionless absolute file paths

## 0.3.1

### Patch Changes

- 375116ad: fix handling of paths resolved outside the root dir. we now correctly use the resolved path when resolving relative imports and when populating the transform cache
- 2f205878: handle null bytes in HTML
- Updated dependencies [375116ad]
  - @web/dev-server-core@0.3.2

## 0.3.0

### Minor Changes

- 0f613e0e: handle modules resolved outside root dir

### Patch Changes

- Updated dependencies [0f613e0e]
  - @web/dev-server-core@0.3.0

## 0.2.13

### Patch Changes

- 5ac055f: don't handle virtual files

## 0.2.12

### Patch Changes

- d6de058: don't throw on unresolved local imports
- 6950c7a: improve error message

## 0.2.11

### Patch Changes

- 4913db2: implement moduleParsed hook
- Updated dependencies [f0472df]
  - @web/dev-server-core@0.2.17

## 0.2.10

### Patch Changes

- e2b93b6: Add error when a bare import cannot be resolved

## 0.2.9

### Patch Changes

- 6949d03: fix serving generated rollup chunks

## 0.2.8

### Patch Changes

- 3d6004b: added rollup bundle plugin

## 0.2.7

### Patch Changes

- b4c2fea: moved test runner dependencies to dev dependencies

## 0.2.6

### Patch Changes

- f22bd2f: add error messages

## 0.2.5

### Patch Changes

- e83ac30: also transform inline non-module scripts
- Updated dependencies [ee8c8d1]
- Updated dependencies [e3e6b22]
  - @web/test-runner-core@0.7.6

## 0.2.4

### Patch Changes

- cd1213e: improved logging of resolving outside root dir
- Updated dependencies [cd1213e]
  - @web/dev-server-core@0.2.6
  - @web/test-runner-core@0.7.5

## 0.2.3

### Patch Changes

- ce2a2e6: align dependencies
- Updated dependencies [ce2a2e6]
  - @web/test-runner-chrome@0.6.4

## 0.2.2

### Patch Changes

- e0ee85f: make sure absolute paths are always returned as-is

## 0.2.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/dev-server-core@0.2.1
  - @web/test-runner-chrome@0.6.1
  - @web/test-runner-core@0.7.1

## 0.2.0

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

- 62ff8b2: make tests work on windows
- Updated dependencies [96dd279]
- Updated dependencies [cdddf68]
- Updated dependencies [fdcf2e5]
- Updated dependencies [62ff8b2]
- Updated dependencies [9be1f95]
  - @web/dev-server-core@0.2.0
  - @web/test-runner-chrome@0.6.0
  - @web/test-runner-core@0.7.0

## 0.1.9

### Patch Changes

- 8fb820b: add an easy way to change served mime types
- Updated dependencies [8fb820b]
  - @web/dev-server-core@0.1.9

## 0.1.8

### Patch Changes

- c7c7cc9: fix(dev-server-rollup): add missing parse5 dependency

## 0.1.7

### Patch Changes

- fdbae14: only add root dir when necessary

## 0.1.6

### Patch Changes

- 556827f: add fromRollup function
- 9484e97: replace rollupAdapter with fromRollup
- 7741a51: don't skip absolute windows paths

## 0.1.5

### Patch Changes

- 6bc4381: handle windows paths in @web/dev-server-rolup

## 0.1.4

### Patch Changes

- 1c915d0: handle inline scripts

## 0.1.3

### Patch Changes

- f9dfcd3: improve rollup syntax error logging
- Updated dependencies [8596276]
  - @web/dev-server-core@0.1.5

## 0.1.2

### Patch Changes

- afc3cc7: update dependencies

## 0.1.1

### Patch Changes

- 1580c82: add getModuleInfo stub

## 0.1.0

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
  - @web/dev-server-core@0.1.0

## 0.0.2

### Patch Changes

- Updated dependencies [9302247]
  - @web/dev-server-core@0.0.3

## 0.0.1

### Patch Changes

- c5da67f: first setup
- Updated dependencies [c5da67f]
  - @web/dev-server-core@0.0.2
