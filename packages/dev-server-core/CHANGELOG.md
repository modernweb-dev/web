# @web/dev-server-core

## 0.3.5

### Patch Changes

- 2c223cf0: filter server stream errors

## 0.3.4

### Patch Changes

- 8861ded8: feat(dev-server-core): share websocket instances with iframe parent

## 0.3.3

### Patch Changes

- 1dd7cd0e: export outside root dir utils

## 0.3.2

### Patch Changes

- 375116ad: fix handling of paths resolved outside the root dir. we now correctly use the resolved path when resolving relative imports and when populating the transform cache

## 0.3.1

### Patch Changes

- eceb6295: match dotfiles when resolving mimetypes

## 0.3.0

### Minor Changes

- 0f613e0e: handle modules resolved outside root dir

## 0.2.19

### Patch Changes

- fb56854: Bust cache when a file is deleted

## 0.2.18

### Patch Changes

- 07edac1: improve handling of dynamic imports

## 0.2.17

### Patch Changes

- f0472df: add fileParsed hook

## 0.2.16

### Patch Changes

- b025992: add debug logging flag

## 0.2.15

### Patch Changes

- a03749e: mark websocket module as resolved import

## 0.2.14

### Patch Changes

- 835d16f: add koa types dependency

## 0.2.13

### Patch Changes

- e8ebfcc: ensure user plugins are run after builtin plugins

## 0.2.12

### Patch Changes

- 1ba84e4: Expose webSocketServer on the WebSocketManager in case developers using the Node API want apply their own WebSocket message handling, but reusing the WebSocket Server of the dev server.

## 0.2.11

### Patch Changes

- 2291ca1: export websocket types

## 0.2.10

### Patch Changes

- 3a2dc12: fixed caching of index.html using directory path

## 0.2.9

### Patch Changes

- 123c0c0: don't serve compressed files

## 0.2.8

### Patch Changes

- 5ba52dd: properly close server on exit
- 8199b68: use web sockets for browser - server communication

## 0.2.7

### Patch Changes

- b1306c9: fixed race condition caching headers

## 0.2.6

### Patch Changes

- cd1213e: improved logging of resolving outside root dir

## 0.2.5

### Patch Changes

- 69717a2: improved logic which stops the server

## 0.2.4

### Patch Changes

- 05f826e: add missing get-stream package

## 0.2.3

### Patch Changes

- 0cc6a82: expose ErrorWithLocation class

## 0.2.2

### Patch Changes

- bc1741d: expose getHtmlPath function

## 0.2.1

### Patch Changes

- aa65fd1: run build before publishing

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

- 96dd279: watch the HTML file for inline scripts
- 62ff8b2: make tests work on windows

## 0.1.9

### Patch Changes

- 8fb820b: add an easy way to change served mime types

## 0.1.8

### Patch Changes

- 04a2cda: make test-runner-browserstack work with dev-server-core

## 0.1.7

### Patch Changes

- 9712125: fix not watching files with syntax errors

## 0.1.6

### Patch Changes

- 8892f98: allow downstream middleware to serve files

## 0.1.5

### Patch Changes

- 8596276: move logger to test runner cli

## 0.1.4

### Patch Changes

- db5baff: cleanup and sort dependencies

## 0.1.3

### Patch Changes

- c104663: run legacy plugin after resolving imports

## 0.1.2

### Patch Changes

- 2672e8a: expose isInlineScriptRequest function

## 0.1.1

### Patch Changes

- 59d3efe: remove dependency on building-utils

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

## 0.0.3

### Patch Changes

- 9302247: allow plugins to set a transform cache key

## 0.0.2

### Patch Changes

- c5da67f: always deduce mime type

## 0.0.1

### Patch Changes

- a65e3c9: first setup
