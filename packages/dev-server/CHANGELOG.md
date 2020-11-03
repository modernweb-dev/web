# @web/dev-server

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
