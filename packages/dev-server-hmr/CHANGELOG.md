# @web/dev-server-hmr

## 0.4.1

### Patch Changes

- fix: update @web/dev-server-core

## 0.4.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/dev-server-core@0.7.0

## 0.3.3

### Patch Changes

- ef6b2543: Use split versions for all lit dependencies

## 0.3.2

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/dev-server-core@0.6.2

## 0.3.1

### Patch Changes

- Updated dependencies [7f0f4315]
  - @web/dev-server-core@0.6.0

## 0.3.0

### Minor Changes

- 0c87f59e: feat/various fixes

  - Update puppeteer to `20.0.0`, fixes #2282
  - Use puppeteer's new `page.mouse.reset()` in sendMousePlugin, fixes #2262
  - Use `development` export condition by default

## 0.2.2

### Patch Changes

- 85647c10: Update `lit-html`

## 0.2.1

### Patch Changes

- 0cd3a2f8: chore(deps): bump puppeteer from 19.8.2 to 19.9.0
- Updated dependencies [c26d3730]
  - @web/dev-server-core@0.5.1

## 0.2.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.

### Patch Changes

- Updated dependencies [ca715faf]
- Updated dependencies [febd9d9d]
  - @web/dev-server-core@0.5.0

## 0.1.12

### Patch Changes

- 9b83280e: Update puppeteer
- Updated dependencies [c103f166]
  - @web/dev-server-core@0.4.1

## 0.1.11

### Patch Changes

- Updated dependencies [ac05ca5d]
- Updated dependencies [acc0a84c]
- Updated dependencies [81db401b]
  - @web/dev-server-core@0.4.0

## 0.1.10

### Patch Changes

- 00da4255: Update es-module-lexer to 1.0.0
- Updated dependencies [00da4255]
  - @web/dev-server-core@0.3.19

## 0.1.9

### Patch Changes

- 2c06f31e: Update puppeteer and puppeteer-core to 8.0.0

## 0.1.8

### Patch Changes

- Updated dependencies [0f613e0e]
  - @web/dev-server-core@0.3.0

## 0.1.7

### Patch Changes

- e2c84e0: clean up bubbling logic

## 0.1.6

### Patch Changes

- 3006e91: update dependencies

## 0.1.5

### Patch Changes

- 74c2bf2: update bubbled dependencies

## 0.1.4

### Patch Changes

- 6f1cb5f: fix resolving relative imports
- b4f79a1: add HMR bubbles option

## 0.1.3

### Patch Changes

- 0df8945: improve dependency tracking

## 0.1.2

### Patch Changes

- 8fab7b1: Prevent dependencies from being cleared eagerly on serve, this prevented from updates to bubble to parents that do accept updates.

## 0.1.1

### Patch Changes

- 01860f8: fix windows paths issue

## 0.1.0

### Minor Changes

- 121f257: [dev-server-hmr] add acceptDeps callback to hmr client

## 0.0.2

### Patch Changes

- 29b5976: initial implementation
- bf3f723: mark HMR module as resolved
- Updated dependencies [a03749e]
  - @web/dev-server-core@0.2.15
