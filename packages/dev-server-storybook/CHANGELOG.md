# @web/dev-server-storybook

## 2.0.3

### Patch Changes

- fix: update @web/dev-server-core

## 2.0.2

### Patch Changes

- d2dbb7b1: fix: sb windows path

## 2.0.1

### Patch Changes

- c796648c: fix: create a require for mdx stories

## 2.0.0

### Major Changes

- 1c0088de: Update Rollup to version 4.

### Patch Changes

- Updated dependencies [1c0088de]
  - @web/rollup-plugin-polyfills-loader@2.1.1
  - @web/rollup-plugin-html@2.1.2

## 1.1.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/rollup-plugin-polyfills-loader@2.1.0
  - @web/rollup-plugin-html@2.1.0
  - @web/dev-server-core@0.7.0

## 1.0.8

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/dev-server-core@0.6.2

## 1.0.7

### Patch Changes

- Updated dependencies [7f0f4315]
  - @web/dev-server-core@0.6.0

## 1.0.6

### Patch Changes

- 7ae27f3c: fix: storybook import for windows

## 1.0.5

### Patch Changes

- e1fc9961: Fix mdx imports once more

## 1.0.4

### Patch Changes

- 4d67523f: Make sure to publish `@web/dev-server-storybook`

## 1.0.3

### Patch Changes

- f6ba53f0: Fix `build-storybook` bin
- Updated dependencies [f6ba53f0]
  - @web/rollup-plugin-polyfills-loader@2.0.1
  - @web/rollup-plugin-html@2.0.1

## 1.0.2

### Patch Changes

- 7102860c: Fixes the entrypoint of the package.

## 1.0.1

### Patch Changes

- 4841ad58: Fix output format of package.

## 1.0.0

### Major Changes

- 68d596ed: This packages is now a ES Module by default.

## 0.7.4

### Patch Changes

- f2362bbf: Trigger pipeline

## 0.7.3

### Patch Changes

- e9c77e06: Version Packages

## 0.7.2

### Patch Changes

- 85647c10: Update `lit-html`
- 5acaf838: Update `@typescript-eslint/parser`
- ab4720fa: fix: terser import

## 0.7.1

### Patch Changes

- dc1d5e84: Fix console logging due to source mapping issues.
- 1109ec37: Replace `rollup-plugin-terser` with `@rollup/plugin-terser`

## 0.7.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.
- 72c63bc5: Require Rollup@v3.x and update all Rollup related dependencies to latest.

### Patch Changes

- Updated dependencies [ca715faf]
- Updated dependencies [febd9d9d]
- Updated dependencies [72c63bc5]
  - @web/dev-server-core@0.5.0
  - @web/rollup-plugin-html@2.0.0
  - @web/rollup-plugin-polyfills-loader@2.0.0

## 0.6.2

### Patch Changes

- fa2c1779: Update @rollup/plugin-babel
- 8128ca53: Update @rollup/plugin-replace
- Updated dependencies [c103f166]
- Updated dependencies [18a16bb0]
  - @web/dev-server-core@0.4.1
  - @web/rollup-plugin-html@1.11.1

## 0.6.1

### Patch Changes

- Updated dependencies [ac05ca5d]
- Updated dependencies [acc0a84c]
- Updated dependencies [81db401b]
  - @web/dev-server-core@0.4.0

## 0.6.0

### Minor Changes

- f7fe8eee: Load CommonJS configuration file if one exists

## 0.5.4

### Patch Changes

- 93b36337: Keep "Default" stories when building Storybook instance

## 0.5.3

### Patch Changes

- 53f74172: fix es-module-lexer logic

## 0.5.2

### Patch Changes

- 00da4255: Update es-module-lexer to 1.0.0
- Updated dependencies [00da4255]
  - @web/dev-server-core@0.3.19

## 0.5.1

### Patch Changes

- 5ca835a2: Error message typo fixed in readStorybookConfig

## 0.5.0

### Minor Changes

- 11074fee: Allow custom logic for finding stories

## 0.4.3

### Patch Changes

- 35fe49d8: Use latest "storybook-addon-markdown-docs"

## 0.4.2

### Patch Changes

- 156e0b66: Update rollup dependency to 2.66.1

## 0.4.1

### Patch Changes

- 6ff9cebc: Fix MDX docs rendering by using Storybook compiler and converting more imports to @web/storybook-prebuilt

## 0.4.0

### Minor Changes

- 0357acf3: Update @web/storybook-prebuilt version

## 0.3.8

### Patch Changes

- e564c039: Use latest upstream dependencies
- 49d26637: Use the latest Storybook Prebuilt which uses the latest Storybook which allows for the use of pre and post `lit@2.0` versions of the Lit libraries.

## 0.3.7

### Patch Changes

- 687d4750: Downgrade @rollup/plugin-node-resolve to v11

## 0.3.6

### Patch Changes

- 9c97ea53: update dependency @rollup/plugin-node-resolve to v13

## 0.3.5

### Patch Changes

- d75676de: normalize paths received from globby

## 0.3.4

### Patch Changes

- f66aaa80: fix checking path on windows

## 0.3.3

### Patch Changes

- a8e5eb8e: configure stories after async setup, this makes some code blocks work on first load
- d5a433a9: fix styling of docs page

## 0.3.2

### Patch Changes

- 74315dbd: only reload preview in watch mode

## 0.3.1

### Patch Changes

- b51ab105: throw when trying to load official storybook addons

## 0.3.0

### Minor Changes

- 36f6ab39: update to node-resolve v11

### Patch Changes

- Updated dependencies [0f613e0e]
  - @web/dev-server-core@0.3.0

## 0.2.0

### Minor Changes

- 9df3a31: support MDJS stories

## 0.1.3

### Patch Changes

- d56c172: add missing dependencies for build
- Updated dependencies [2006211]
  - @web/rollup-plugin-polyfills-loader@1.0.3

## 0.1.2

### Patch Changes

- d955e42: include manager.js file

## 0.1.1

### Patch Changes

- cba758e: feat(dev-server-storybook): throw when no config is given
- c46774c: add support for manager/preview head/body partials

## 0.1.0

### Minor Changes

- 3d9bb3d: add support for MDX

### Patch Changes

- 1a211af: add build command

## 0.0.2

### Patch Changes

- 80edd17: fix loading multiple stories
- Updated dependencies [835d16f]
  - @web/dev-server-core@0.2.14

## 0.0.1

### Patch Changes

- 2cdc3b1: first implementation
