# @web/dev-server

## 0.4.6

### Patch Changes

- 39ff6ffb: replace ip dependency due to security bug CVE-2024-29415

## 0.4.5

### Patch Changes

- fix: update @web/dev-server-core

## 0.4.4

### Patch Changes

- d2dbb7b1: fix: sb windows path

## 0.4.3

### Patch Changes

- e657791f: Vulnerability fix in `ip` package.
  For more info, see:

  - https://github.com/advisories/GHSA-78xj-cgh5-2h22
  - https://github.com/indutny/node-ip/issues/136#issuecomment-1952083593

## 0.4.2

### Patch Changes

- 649edc2b: Add option to modify chokidar watchOptions with @web/dev-server
- Updated dependencies [649edc2b]
  - @web/dev-server-core@0.7.1

## 0.4.1

### Patch Changes

- e31de569: Update `@web/dev-server-rollup` to latest version

## 0.4.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/dev-server-rollup@0.6.0
  - @web/dev-server-core@0.7.0
  - @web/config-loader@0.3.0

## 0.3.7

### Patch Changes

- ef6b2543: Use split versions for all lit dependencies

## 0.3.6

### Patch Changes

- 615db977: cleanup exports
- Updated dependencies [27493246]
  - @web/dev-server-core@0.6.3

## 0.3.5

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/dev-server-rollup@0.5.4
  - @web/dev-server-core@0.6.2
  - @web/config-loader@0.2.2

## 0.3.4

### Patch Changes

- Updated dependencies [7f0f4315]
  - @web/dev-server-core@0.6.0
  - @web/dev-server-rollup@0.5.3

## 0.3.3

### Patch Changes

- d9996d2d: Fix an issue where the nodeResolve plugin wasn't accepting user configuration correctly

## 0.3.2

### Patch Changes

- 7ae27f3c: fix: storybook import for windows

## 0.3.1

### Patch Changes

- 5470b5b9: generate types entrypoint

## 0.3.0

### Minor Changes

- 0c87f59e: feat/various fixes

  - Update puppeteer to `20.0.0`, fixes #2282
  - Use puppeteer's new `page.mouse.reset()` in sendMousePlugin, fixes #2262
  - Use `development` export condition by default

## 0.2.5

### Patch Changes

- f2362bbf: Trigger pipeline

## 0.2.4

### Patch Changes

- e9c77e06: Version Packages

## 0.2.3

### Patch Changes

- 015766e9: Use new headless chrome mode

## 0.2.2

### Patch Changes

- 85647c10: Update `lit-html`
- ab4720fa: fix: terser import
- Updated dependencies [6ab3ee55]
  - @web/dev-server-rollup@0.5.1

## 0.2.1

### Patch Changes

- 0cd3a2f8: chore(deps): bump puppeteer from 19.8.2 to 19.9.0
- c26d3730: Update TypeScript
- Updated dependencies [c26d3730]
  - @web/dev-server-core@0.5.1
  - @web/config-loader@0.2.1

## 0.2.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.
- 72c63bc5: Require Rollup@v3.x and update all Rollup related dependencies to latest.

### Patch Changes

- Updated dependencies [ca715faf]
- Updated dependencies [febd9d9d]
- Updated dependencies [b7d8ee66]
- Updated dependencies [72c63bc5]
  - @web/dev-server-core@0.5.0
  - @web/config-loader@0.2.0
  - @web/dev-server-rollup@0.5.0

## 0.1.38

### Patch Changes

- c103f166: Update `isbinaryfile`
- 18a16bb0: Update `html-minifier-terser`
- d8579f15: Update `command-line-usage`
- 9b83280e: Update puppeteer
- 8128ca53: Update @rollup/plugin-replace
- Updated dependencies [fa2c1779]
- Updated dependencies [c103f166]
- Updated dependencies [1113fa09]
- Updated dependencies [817d674b]
- Updated dependencies [bd12ff9b]
- Updated dependencies [8128ca53]
  - @web/dev-server-rollup@0.4.1
  - @web/dev-server-core@0.4.1

## 0.1.37

### Patch Changes

- 0f5631d0: chore(deps): bump ua-parser-js from 1.0.32 to 1.0.33

## 0.1.36

### Patch Changes

- 737fbcb1: Fix the typings file name for the main entrypoint
- 81db401b: Generate longer self signed keys Closes #2122
- Updated dependencies [ac05ca5d]
- Updated dependencies [acc0a84c]
- Updated dependencies [81db401b]
- Updated dependencies [a2198172]
  - @web/dev-server-core@0.4.0
  - @web/dev-server-rollup@0.4.0

## 0.1.35

### Patch Changes

- 04e2fa7d: Update portfinder dependency to 1.0.32

## 0.1.34

### Patch Changes

- 93b36337: Keep "Default" stories when building Storybook instance

## 0.1.33

### Patch Changes

- 00da4255: Update es-module-lexer to 1.0.0
- Updated dependencies [00da4255]
  - @web/dev-server-core@0.3.19
  - @web/dev-server-rollup@0.3.19

## 0.1.32

### Patch Changes

- 78d610d1: Update Rollup, use moduleSideEffects flag
- Updated dependencies [78d610d1]
- Updated dependencies [39610b4c]
  - @web/dev-server-rollup@0.3.18
  - @web/dev-server-core@0.3.18

## 0.1.31

### Patch Changes

- e10b680d: Support node entry points (export map) containing stars.
- Updated dependencies [e10b680d]
  - @web/dev-server-rollup@0.3.16

## 0.1.30

### Patch Changes

- 35fe49d8: Use latest "storybook-addon-markdown-docs"

## 0.1.29

### Patch Changes

- 6ff9cebc: Fix MDX docs rendering by using Storybook compiler and converting more imports to @web/storybook-prebuilt

## 0.1.28

### Patch Changes

- cbbd5fc8: Resolve missing peer dependency of @rollup/plugin-node-resolve by moving and exposing @rollup/plugin-node-resolve to @web/dev-server-rollup
- Updated dependencies [cbbd5fc8]
  - @web/dev-server-rollup@0.3.13

## 0.1.27

### Patch Changes

- b2c081d8: When serving content to an iframe within a csp restricted page, the websocket script may not be able to access the parent window.
  Accessing it may result in an uncaught DOMException which we now handle.
- Updated dependencies [b2c081d8]
  - @web/dev-server-core@0.3.17

## 0.1.26

### Patch Changes

- 2b226517: Update whatwg-url dependency to 10.0.0
- 8a1dfdc0: Update whatwg-url dependency to 11.0.0
- Updated dependencies [2b226517]
- Updated dependencies [8a1dfdc0]
  - @web/dev-server-rollup@0.3.12

## 0.1.25

### Patch Changes

- 96f656aa: Update Rollup to 2.58.0, use isEntry flag
- Updated dependencies [96f656aa]
  - @web/dev-server-rollup@0.3.11

## 0.1.24

### Patch Changes

- a09282b4: Replace chalk with nanocolors
- Updated dependencies [a09282b4]
  - @web/dev-server-core@0.3.16
  - @web/dev-server-rollup@0.3.10

## 0.1.23

### Patch Changes

- 369394fe: Update dependency es-module-lexer to ^0.9.0
- Updated dependencies [369394fe]
  - @web/dev-server-core@0.3.15

## 0.1.22

### Patch Changes

- dc61726d: Update dependency es-module-lexer to ^0.7.1
- Updated dependencies [dc61726d]
  - @web/dev-server-core@0.3.14

## 0.1.21

### Patch Changes

- 49dcb6bb: Update Rollup dependency to 2.56.2
- Updated dependencies [49dcb6bb]
  - @web/dev-server-rollup@0.3.9

## 0.1.20

### Patch Changes

- 687d4750: Downgrade @rollup/plugin-node-resolve to v11
- Updated dependencies [687d4750]
  - @web/dev-server-rollup@0.3.7

## 0.1.19

### Patch Changes

- 9c97ea53: update dependency @rollup/plugin-node-resolve to v13
- Updated dependencies [9c97ea53]
  - @web/dev-server-rollup@0.3.6

## 0.1.18

### Patch Changes

- 6222d0b4: fix(dev-server): fixes #1536, correctly handle outside-root paths
- Updated dependencies [6222d0b4]
  - @web/dev-server-rollup@0.3.5

## 0.1.17

### Patch Changes

- e7efd5b7: use script origin to connect websocket
- Updated dependencies [e7efd5b7]
  - @web/dev-server-core@0.3.12

## 0.1.16

### Patch Changes

- 6bf34874: fix open URL with base path and app index

## 0.1.15

### Patch Changes

- 6c5893cc: use unescaped import specifier
- Updated dependencies [6c5893cc]
  - @web/dev-server-core@0.3.11

## 0.1.14

### Patch Changes

- 2c06f31e: Update puppeteer and puppeteer-core to 8.0.0

## 0.1.13

### Patch Changes

- 780a3520: Use http2 config for websocket protocol check
- 90375262: Upgrade to esbuild ^0.11.0
- Updated dependencies [780a3520]
  - @web/dev-server-core@0.3.10

## 0.1.12

### Patch Changes

- 6772f9cc: Detect websocket url from server
- Updated dependencies [6772f9cc]
  - @web/dev-server-core@0.3.9

## 0.1.11

### Patch Changes

- 0a05464b: do not resolve multiple times outside root files
- Updated dependencies [0a05464b]
  - @web/dev-server-rollup@0.3.3

## 0.1.10

### Patch Changes

- bc6e88e2: correctly reference base path

## 0.1.9

### Patch Changes

- d59241f1: add support for base path
- Updated dependencies [d59241f1]
  - @web/dev-server-core@0.3.8

## 0.1.8

### Patch Changes

- 1265c13e: Migrate websocket endpoint away from '/' to '/wds'. This allows end users to potentially proxy web sockets with out colliding with WebDevServer's websocket.
- Updated dependencies [1265c13e]
  - @web/dev-server-core@0.3.7

## 0.1.7

### Patch Changes

- 096fe25f: add stream close error to filter
- Updated dependencies [83750cd2]
- Updated dependencies [096fe25f]
  - @web/dev-server-core@0.3.6

## 0.1.6

### Patch Changes

- 2c223cf0: filter server stream errors
- Updated dependencies [2c223cf0]
  - @web/dev-server-core@0.3.5

## 0.1.5

### Patch Changes

- 82ce63d1: add backwards compatibility for "middlewares" config property

## 0.1.4

### Patch Changes

- 5d36f239: allow resolving extensionless absolute file paths
- Updated dependencies [5d36f239]
  - @web/dev-server-rollup@0.3.2

## 0.1.3

### Patch Changes

- 375116ad: fix handling of paths resolved outside the root dir. we now correctly use the resolved path when resolving relative imports and when populating the transform cache
- Updated dependencies [375116ad]
- Updated dependencies [2f205878]
  - @web/dev-server-core@0.3.2
  - @web/dev-server-rollup@0.3.1

## 0.1.2

### Patch Changes

- b92fa63e: filter out non-objects from config

## 0.1.1

### Patch Changes

- eceb6295: match dotfiles when resolving mimetypes
- Updated dependencies [eceb6295]
  - @web/dev-server-core@0.3.1

## 0.1.0

### Minor Changes

- 0f613e0e: handle modules resolved outside root dir
- 36f6ab39: update to node-resolve v11

### Patch Changes

- 6055a600: export partial dev serve config
- Updated dependencies [6e313c18]
- Updated dependencies [0f613e0e]
  - @web/config-loader@0.1.3
  - @web/dev-server-core@0.3.0
  - @web/dev-server-rollup@0.3.0

## 0.0.29

### Patch Changes

- b327702: export plugins

## 0.0.28

### Patch Changes

- 5ac055f: don't handle virtual files
- Updated dependencies [5ac055f]
  - @web/dev-server-rollup@0.2.13

## 0.0.27

### Patch Changes

- d6de058: don't throw on unresolved local imports
- Updated dependencies [d6de058]
- Updated dependencies [6950c7a]
  - @web/dev-server-rollup@0.2.12

## 0.0.26

### Patch Changes

- 92f2061: don't clear scrollback buffer

## 0.0.25

### Patch Changes

- fb56854: Bust cache when a file is deleted
- Updated dependencies [fb56854]
  - @web/dev-server-core@0.2.19

## 0.0.24

### Patch Changes

- 28890a0: update to latest esbuild

## 0.0.23

### Patch Changes

- 07edac1: improve handling of dynamic imports
- Updated dependencies [07edac1]
  - @web/dev-server-core@0.2.18

## 0.0.22

### Patch Changes

- 3434dc8: chore: cleanup dev-server-cli leftovers
- ba418f6: handle preserve-symlinks CLI arg

## 0.0.21

### Patch Changes

- f0472df: add fileParsed hook
- Updated dependencies [f0472df]
- Updated dependencies [4913db2]
  - @web/dev-server-core@0.2.17
  - @web/dev-server-rollup@0.2.11

## 0.0.20

### Patch Changes

- b025992: add debug logging flag
- Updated dependencies [b025992]
  - @web/dev-server-core@0.2.16

## 0.0.19

### Patch Changes

- d8c1e1e: remove logging

## 0.0.18

### Patch Changes

- a03749e: mark websocket module as resolved import
- Updated dependencies [a03749e]
  - @web/dev-server-core@0.2.15

## 0.0.17

### Patch Changes

- 835d16f: add koa types dependency
- Updated dependencies [835d16f]
  - @web/dev-server-core@0.2.14

## 0.0.16

### Patch Changes

- e2b93b6: Add error when a bare import cannot be resolved
- Updated dependencies [e2b93b6]
  - @web/dev-server-rollup@0.2.10

## 0.0.15

### Patch Changes

- e8ebfcc: ensure user plugins are run after builtin plugins
- Updated dependencies [e8ebfcc]
  - @web/dev-server-core@0.2.13

## 0.0.14

### Patch Changes

- 201ffbd: updated esbuild dependency

## 0.0.13

### Patch Changes

- db0cf85: Allow user to set open to false, which should result in the browser not opening. Do a falsy check, instead of null && undefined.

## 0.0.12

### Patch Changes

- b939ea0: use a deterministic starting point when finding an available port
- 5ffc1a6: add port CLI flag

## 0.0.11

### Patch Changes

- 3a2dc12: fixed caching of index.html using directory path
- Updated dependencies [3a2dc12]
  - @web/dev-server-core@0.2.10

## 0.0.10

### Patch Changes

- 5763462: Make sure to include the index.mjs in the npm package so es module users do have an valid entrypoint. Also include the typescript files in src so sourcemaps can point to them while debugging.

## 0.0.9

### Patch Changes

- 123c0c0: don't serve compressed files
- Updated dependencies [123c0c0]
  - @web/dev-server-core@0.2.9

## 0.0.8

### Patch Changes

- 5ba52dd: properly close server on exit
- 8199b68: use web sockets for browser - server communication
- Updated dependencies [5ba52dd]
- Updated dependencies [8199b68]
  - @web/dev-server-core@0.2.8

## 0.0.7

### Patch Changes

- fb68716: made the server composable by other tools

## 0.0.6

### Patch Changes

- 40e8bf2: log syntax errors to the browser
- Updated dependencies [40e8bf2]
  - @web/dev-server-cli@0.0.3

## 0.0.5

### Patch Changes

- b1306c9: fixed race condition caching headers
- Updated dependencies [b1306c9]
  - @web/dev-server-core@0.2.7

## 0.0.4

### Patch Changes

- 6694af7: added esbuild-target flag
- Updated dependencies [e83ac30]
  - @web/dev-server-rollup@0.2.5

## 0.0.3

### Patch Changes

- cd1213e: improved logging of resolving outside root dir
- Updated dependencies [cd1213e]
  - @web/dev-server-core@0.2.6
  - @web/dev-server-rollup@0.2.4

## 0.0.2

### Patch Changes

- 69717a2: improved logic which stops the server
- 470ac7c: added watch mode flag
- d71a9b5: clear terminal on file changes
- Updated dependencies [69717a2]
- Updated dependencies [d71a9b5]
  - @web/dev-server-cli@0.0.2
  - @web/dev-server-core@0.2.5

## 0.0.1

### Patch Changes

- 0cc6a82: first implementation
- Updated dependencies [0cc6a82]
  - @web/dev-server-cli@0.0.1
