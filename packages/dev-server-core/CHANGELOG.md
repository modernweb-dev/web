# @web/dev-server-core

## 0.7.5

### Patch Changes

- b99a0915: Bump express to 4.21.2 to include path-to-regexp fix

## 0.7.4

### Patch Changes

- fb33d75c: bump "express" from 4.18.2 to 4.21.1 to use updated "cookie" with vulnerability fixes

## 0.7.3

### Patch Changes

- 3aec4aa6: bump chokidar to v4

## 0.7.2

### Patch Changes

- 4a4b6995: Fix readonly object serialization

## 0.7.1

### Patch Changes

- 649edc2b: Add option to modify chokidar watchOptions with @web/dev-server

## 0.7.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/parse5-utils@2.1.0

## 0.6.3

### Patch Changes

- 27493246: add types for remaining exports

## 0.6.2

### Patch Changes

- 640ba85f: added types for main entry point
- Updated dependencies [640ba85f]
  - @web/parse5-utils@2.0.2

## 0.6.1

### Patch Changes

- 95715f9b: Allow web socket based refresh in middleware mode, by accepting the source `server` as an option for the `middlewareMode` config property

## 0.6.0

### Minor Changes

- 7f0f4315: Raise-up the maxSessionMemory of the http2 server to avoid network errors when a large number of files are served

## 0.5.2

### Patch Changes

- ce57936c: support middleware mode

  BREAKING CHANGE

  Theoretically it's a breaking change for Plugin API since now `serverStart` hook might not have a param `server`.
  The breaking change shouldnt impact your codebase immediately since you need to first activate `middlewareMode` to actually break stuff if any plugin depends on the existence of the `server` arg that gets passed to the plugin, but type wise it might break compilation of such plugins right away. Considering that `@web/dev-server` is still on semver 0.x.x, and since the impact of this breaking change should be very minimal, we decided to make the breaking change in this patch version.

## 0.5.1

### Patch Changes

- c26d3730: Update TypeScript

## 0.5.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.

### Patch Changes

- ca715faf: Upgrade lru-cache dependency & add a file cache for v8-to-istanbul conversions
- Updated dependencies [febd9d9d]
  - @web/parse5-utils@2.0.0

## 0.4.1

### Patch Changes

- c103f166: Update `isbinaryfile`
- Updated dependencies [18a16bb0]
  - @web/parse5-utils@1.3.1

## 0.4.0

### Minor Changes

- ac05ca5d: Add option to disable the fileWatcher in the dev server, to allow the test-runner to run once without files added to the watcher.
- acc0a84c: Expand support for Rollup plugins with child plugins, specifically the Node Resolve plugin.

### Patch Changes

- 81db401b: Generate longer self signed keys Closes #2122

## 0.3.19

### Patch Changes

- 00da4255: Update es-module-lexer to 1.0.0

## 0.3.18

### Patch Changes

- 39610b4c: Handle 'upgrade' requests only for matched url.

## 0.3.17

### Patch Changes

- b2c081d8: When serving content to an iframe within a csp restricted page, the websocket script may not be able to access the parent window.
  Accessing it may result in an uncaught DOMException which we now handle.

## 0.3.16

### Patch Changes

- a09282b4: Replace chalk with nanocolors

## 0.3.15

### Patch Changes

- 369394fe: Update dependency es-module-lexer to ^0.9.0

## 0.3.14

### Patch Changes

- dc61726d: Update dependency es-module-lexer to ^0.7.1

## 0.3.13

### Patch Changes

- fca0a4c3: Safely stringify error messages in tests

## 0.3.12

### Patch Changes

- e7efd5b7: use script origin to connect websocket

## 0.3.11

### Patch Changes

- 6c5893cc: use unescaped import specifier

## 0.3.10

### Patch Changes

- 780a3520: Use http2 config for websocket protocol check

## 0.3.9

### Patch Changes

- 6772f9cc: Detect websocket url from server

## 0.3.8

### Patch Changes

- d59241f1: add support for base path

## 0.3.7

### Patch Changes

- 1265c13e: Migrate websocket endpoint away from '/' to '/wds'. This allows end users to potentially proxy web sockets with out colliding with WebDevServer's websocket.

## 0.3.6

### Patch Changes

- 83750cd2: fallback to fetch on IE11
- 096fe25f: add stream close error to filter
- Updated dependencies [b5af71e3]
  - @web/parse5-utils@1.2.0

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
