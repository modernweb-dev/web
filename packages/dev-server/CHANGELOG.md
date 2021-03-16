# @web/dev-server

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
