# @web/polyfills-loader

## 2.3.0

### Minor Changes

- 74b3e1bd: Set fetchPriority of polyfill scripts to `high`

## 2.2.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/parse5-utils@2.1.0

## 2.1.5

### Patch Changes

- 76a2f86f: update entrypoints

## 2.1.4

### Patch Changes

- 55d9ea1b: fix: export polyfills data

## 2.1.3

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/parse5-utils@2.0.2

## 2.1.2

### Patch Changes

- cb5da085: Minify `es-modules-shims`

## 2.1.1

### Patch Changes

- 85647c10: Update `lit-html`
- 5acaf838: Update `@typescript-eslint/parser`

## 2.1.0

### Minor Changes

- 6a8a7648: add support for the Scoped CustomElementRegistry polyfill (this is a prototype polyfill)

## 2.0.1

### Patch Changes

- c26d3730: Update TypeScript

## 2.0.0

### Major Changes

- febd9d9d: Set node 16 as the minimum version.

### Patch Changes

- Updated dependencies [febd9d9d]
  - @web/parse5-utils@2.0.0

## 1.4.1

### Patch Changes

- f80b22ed: fix(polyfills-loader): reverse condition to load the polyfill for constructable stylesheets

## 1.4.0

### Minor Changes

- ab5abe10: feat(polyfills-loader): add URLPattern polyfill

## 1.3.5

### Patch Changes

- ca516a01: Update terser to 5.14.2

## 1.3.4

### Patch Changes

- e9508a24: fix: support node 17 & 18 by using md5 hashing

## 1.3.3

### Patch Changes

- d3492789: Fixed typo in the loadScriptFunction function parameter (attr to att).

## 1.3.2

### Patch Changes

- 16f33e3e: make polyfills loader work on IE11
- 283c9258: add missing dependency
- 642d5253: add missing dependency

## 1.3.1

### Patch Changes

- d872ce9c: fix: use correct property

## 1.3.0

### Minor Changes

- 03f1481c: Add option to externalize polyfills loader script

## 1.2.2

### Patch Changes

- 62623d18: fix: always load EMS for config option 'always'

## 1.2.1

### Patch Changes

- e24a47c2: Added support for module-shim

## 1.2.0

### Minor Changes

- 738043d1: feat: add constructible stylesheets polyfill to loader

## 1.1.2

### Patch Changes

- ca749b0e: Update dependency @types/parse5 to v6
- Updated dependencies [ca749b0e]
  - @web/parse5-utils@1.3.0

## 1.1.1

### Patch Changes

- 68726a66: fix to export createPolyfillsLoader

## 1.1.0

### Minor Changes

- 0892bddd: Retain script tag attributes

## 1.0.2

### Patch Changes

- ac379b48: fix(rollup-plugin-polyfills-loader): fix relative paths to polyfills with `flattenOutput: false`

## 1.0.1

### Patch Changes

- 2006211: update minimum systemjs version

## 1.0.0

### Major Changes

- 369308b: Initial implementation

### Patch Changes

- Updated dependencies [a7c9af6]
  - @web/parse5-utils@1.1.2
