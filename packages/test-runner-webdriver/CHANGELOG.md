# @web/test-runner-webdriver

## 0.9.0

### Minor Changes

- e755f6b: Upgrade WebdriverIO to v9, drop JWP capabilities

## 0.8.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/test-runner-core@0.13.0

## 0.7.2

### Patch Changes

- Updated dependencies [43be7391]
  - @web/test-runner-core@0.12.0

## 0.7.1

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/test-runner-core@0.11.6

## 0.7.0

### Minor Changes

- 812400a3: Update `webdriver` to version 8

### Patch Changes

- Updated dependencies [c26d3730]
  - @web/test-runner-core@0.11.1

## 0.6.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.

### Patch Changes

- Updated dependencies [febd9d9d]
  - @web/test-runner-core@0.11.0

## 0.5.1

### Patch Changes

- 8a813171: Navigations to blank pages now use `about:blank` instead of `data:,`.

## 0.5.0

### Minor Changes

- 064b9dde: Add a resetMouse command that resets the mouse position and releases mouse buttons.

## 0.4.3

### Patch Changes

- bfa1d1ca: Update webdriver dependency to 7.16.0

## 0.4.2

### Patch Changes

- 33ada3d8: Align @web/test-runner-core version

## 0.4.1

### Patch Changes

- 6014eba2: Bump webdriverio dependency to 7.9.0

## 0.4.0

### Minor Changes

- 5d440dbd: Bump webdriverio to 7.7.4

## 0.3.0

### Minor Changes

- d1227d88: Update webdriverio dependency to v7

## 0.2.3

### Patch Changes

- e3314b02: update dependency on core

## 0.2.2

### Patch Changes

- 8861ded8: feat(dev-server-core): share websocket instances with iframe parent
- Updated dependencies [8861ded8]
  - @web/test-runner-core@0.10.6

## 0.2.1

### Patch Changes

- 967f12d9: Fix intermittent testsStartTimeout on Safari on Sauce

## 0.2.0

### Minor Changes

- a7d74fdc: drop support for node v10 and v11
- 1dd7cd0e: version bump after breaking change in @web/test-runner-core

### Patch Changes

- Updated dependencies [1dd7cd0e]
- Updated dependencies [a7d74fdc]
  - @web/test-runner-core@0.10.0

## 0.1.3

### Patch Changes

- 69b2d13d: use about:blank to kill stale browser pages, this makes tests that rely on browser focus work with puppeteer

## 0.1.2

### Patch Changes

- 75fba3d0: lazily create webdriver connection

## 0.1.1

### Patch Changes

- 5b117da4: add heartbeat to webdriver launcher

## 0.1.0

### Minor Changes

- 6e313c18: merged @web/test-runner-cli package into @web/test-runner

### Patch Changes

- Updated dependencies [6e313c18]
- Updated dependencies [0f613e0e]
  - @web/test-runner-core@0.9.0

## 0.0.3

### Patch Changes

- ecfb31c: Update launcher type to webdriver

## 0.0.2

### Patch Changes

- 40cd5f6: Fixed the generated entrypoint

## 0.0.1

### Patch Changes

- 4c71303: Initial implementation of WebdriverIO launcher
