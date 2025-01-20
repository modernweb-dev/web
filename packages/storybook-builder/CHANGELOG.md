# @web/storybook-builder

## 0.1.21

### Patch Changes

- a82925e: include missing dependency on @web/config-loader

## 0.1.20

### Patch Changes

- b99a0915: Bump express to 4.21.2 to include path-to-regexp fix
- Updated dependencies [b99a0915]
  - @web/dev-server-core@0.7.5

## 0.1.19

### Patch Changes

- fb33d75c: bump "express" from 4.18.2 to 4.21.1 to use updated "cookie" with vulnerability fixes
- f506af31: Upgrade esbuild to 0.24.x
- Updated dependencies [fb33d75c]
  - @web/dev-server-core@0.7.4

## 0.1.18

### Patch Changes

- 75747976: fix relative path by starting with ./

## 0.1.17

### Patch Changes

- c0fefb04: fix storybook-builder on Windows

## 0.1.16

### Patch Changes

- fix: update @web/dev-server-core

## 0.1.15

### Patch Changes

- 7b110644: fix providerImportSource extension when using @storybook/addon-essentials

## 0.1.14

### Patch Changes

- e30da4a0: support MDX and autodocs

## 0.1.13

### Patch Changes

- a506c352: clean up `.prebundled_modules` before creating new bundles

## 0.1.12

### Patch Changes

- 9118c648: clean up NODE_PATH from bundled modules output

## 0.1.11

### Patch Changes

- c98a2798: simplify and speed up the CommonJS to ESM transformation
  make React conditional reexports work in production

## 0.1.10

### Patch Changes

- 1ef0c676: support @storybook/addon-a11y

## 0.1.9

### Patch Changes

- f29dbce3: bundle preview assets

## 0.1.8

### Patch Changes

- 331e6215: fix tocbot default import by @storybook/blocks

## 0.1.7

### Patch Changes

- cbcc56f2: fix tocbot exports for addon-docs
- 5a428555: prebundle required CommonJS modules for addon-docs
- 916da5f0: resolve @storybook/react-dom-shim for addon-docs

## 0.1.6

### Patch Changes

- 010eed69: fix: import both globals and globalsNameReferenceMap from @storybook/preview/globals and use the one that is set. This fixes issue https://github.com/modernweb-dev/web/issues/2619

## 0.1.5

### Patch Changes

- 1c0088de: Update Rollup to version 4.
- Updated dependencies [1c0088de]
  - @web/rollup-plugin-html@2.1.2
  - @web/dev-server-rollup@0.6.1

## 0.1.4

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/rollup-plugin-html@2.1.0
  - @web/dev-server-rollup@0.6.0
  - @web/dev-server-core@0.7.0
  - @web/dev-server@0.4.0

## 0.1.3

### Patch Changes

- afe4df6c: improve prebundling to target only really necessary packages

## 0.1.2

### Patch Changes

- 95715f9b: Pass Storybook server into middleware mode to enable live refresh
- Updated dependencies [95715f9b]
  - @web/dev-server-core@0.6.1

## 0.1.1

### Patch Changes

- Updated dependencies [7f0f4315]
  - @web/dev-server-core@0.6.0
  - @web/dev-server@0.3.4
  - @web/dev-server-rollup@0.5.3

## 0.1.0

### Minor Changes

- 659ed7e2: initial release of @web/storybook-builder
