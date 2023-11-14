# @web/dev-server-esbuild

## 1.0.1

### Patch Changes

- e31de569: Update `@web/dev-server-rollup` to latest version

## 1.0.0

### Major Changes

- 8218a0a5: Update ESBuild to latest version.

  ESBuild has changed how TypeScript decorators are enabled in preparation for JavaScript decorators to land in browsers. ESBuild now requires the `experimentalDecorators` key to be set to `true` in the `tsconfig.json` for TypeScript decorators to be enabled.

  If you are having issues with decorators after updating to this version, try setting the `experimentalDecorators` key in your `tsconfig.json`.

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/dev-server-core@0.7.0

## 0.4.4

### Patch Changes

- ef6b2543: Use split versions for all lit dependencies

## 0.4.3

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/dev-server-core@0.6.2

## 0.4.2

### Patch Changes

- Updated dependencies [7f0f4315]
  - @web/dev-server-core@0.6.0

## 0.4.1

### Patch Changes

- c26d3730: Update TypeScript
- Updated dependencies [c26d3730]
  - @web/dev-server-core@0.5.1

## 0.4.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.

### Patch Changes

- Updated dependencies [ca715faf]
- Updated dependencies [febd9d9d]
  - @web/dev-server-core@0.5.0

## 0.3.6

### Patch Changes

- 8128ca53: Update @rollup/plugin-replace
- Updated dependencies [c103f166]
  - @web/dev-server-core@0.4.1

## 0.3.5

### Patch Changes

- 0f5631d0: chore(deps): bump ua-parser-js from 1.0.32 to 1.0.33

## 0.3.4

### Patch Changes

- 1b2ae08c: Bump the `esbuild` version to `^0.16 || ^0.17` fix a decorator bug in 0.14
- Updated dependencies [ac05ca5d]
- Updated dependencies [acc0a84c]
- Updated dependencies [81db401b]
  - @web/dev-server-core@0.4.0

## 0.3.3

### Patch Changes

- cfc2aa1e: Expose banner/footer as a pass-through to esbuild transform

## 0.3.2

### Patch Changes

- 00da4255: Update es-module-lexer to 1.0.0
- Updated dependencies [00da4255]
  - @web/dev-server-core@0.3.19

## 0.3.1

### Patch Changes

- d0e5e3f0: Add a `tsconfig` option which can be pointed towards your tsconfig.json to keep esbuild and typescript in sync.

  Usage example:

  ```js
  import { fileURLToPath } from 'url';
  esbuildPlugin({
    ts: true,
    tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
  });
  ```

  Note: Without the above code the `tsconfig.json` file will not be used.

## 0.3.0

### Minor Changes

- c1946b04: Relax `esbuild` semver dependency from `^0.12.21` to `^0.12 || ^0.13 || ^0.14`.

## 0.2.16

### Patch Changes

- d406c772: Do not process scripts with non-JS type attribute
- Updated dependencies [b2c081d8]
  - @web/dev-server-core@0.3.17

## 0.2.15

### Patch Changes

- 9f4940f0: Update ua-parser-js dependency to 1.0.2

## 0.2.14

### Patch Changes

- bf89ce23: Update dependency @mdn/browser-compat-data to v4

## 0.2.13

### Patch Changes

- 9f96e7be: Update esbuild dependency to ^0.12.21

## 0.2.12

### Patch Changes

- 90375262: Upgrade to esbuild ^0.11.0
- 020917c4: Do not override js loader with esbuild target
- Updated dependencies [780a3520]
  - @web/dev-server-core@0.3.10

## 0.2.11

### Patch Changes

- 87705b04: pass `esbuildconfig.define` to esbuild transform function

## 0.2.10

### Patch Changes

- c7f8d271: set esm format for non jslike loaders
- Updated dependencies [375116ad]
  - @web/dev-server-core@0.3.2

## 0.2.9

### Patch Changes

- Updated dependencies [0f613e0e]
  - @web/dev-server-core@0.3.0

## 0.2.8

### Patch Changes

- 28890a0: update to latest esbuild

## 0.2.6

### Patch Changes

- 46a01fb: filter unsupported sourcemap warnings

## 0.2.5

### Patch Changes

- 8111c2f: upgrade mdn-browser-compat-data to @mdn/browser-compat-data
- 201ffbd: updated esbuild dependency

## 0.2.4

### Patch Changes

- be76d89: exposed strict option for esbuild

## 0.2.3

### Patch Changes

- dc2d689: added esbuild auto and auto-always flags
- bb53e68: add support for JSON loader

## 0.2.2

### Patch Changes

- ce2a2e6: align dependencies

## 0.2.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/dev-server-core@0.2.1

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
- Updated dependencies [62ff8b2]
- Updated dependencies [9be1f95]
  - @web/dev-server-core@0.2.0

## 0.1.5

### Patch Changes

- 5a33916: support .js extensions in TS imports

## 0.1.4

### Patch Changes

- 38a8505: improve esbuild syntax error logging
- Updated dependencies [8596276]
  - @web/dev-server-core@0.1.5

## 0.1.3

### Patch Changes

- 8b94b03: update to esbuild 0.6.x

## 0.1.2

### Patch Changes

- 339722c: don't compile class fields when transforming ts

## 0.1.1

### Patch Changes

- 89214f0: update to latest esbuild
- Updated dependencies [59d3efe]
  - @web/dev-server-core@0.1.1

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

## 0.0.5

### Patch Changes

- 5da18d7: compile class fields strictly
- d1cc35c: set transform cache key
- Updated dependencies [9302247]
  - @web/dev-server-core@0.0.3

## 0.0.4

### Patch Changes

- a4d32b3: add auto compatibility mode

## 0.0.3

### Patch Changes

- 271ef35: allow setting loader for file extension

## 0.0.2

### Patch Changes

- bffc09b: fix package json main

## 0.0.1

### Patch Changes

- 52803c0: add esbuild plugin
