# @web/test-runner-commands

## 0.5.13

### Patch Changes

- fac4bb04: Fix snapshots with # character

## 0.5.12

### Patch Changes

- ea6d42eb: Fixes the payload type of the readFile command (was WriteFilePayload, now ReadFilePayload).

## 0.5.11

### Patch Changes

- 62369e4d: Upgrade playwright to 1.14.0 which enables prefers-reduced-motion

## 0.5.10

### Patch Changes

- 33ada3d8: Align @web/test-runner-core version

## 0.5.9

### Patch Changes

- 056ba8c8: Add sendKeys support for webdriver

## 0.5.8

### Patch Changes

- 687d4750: Downgrade @rollup/plugin-node-resolve to v11

## 0.5.7

### Patch Changes

- 09af51ac: Escape the snapshot contents to avoid problems in Firrefox and Webkit

## 0.5.6

### Patch Changes

- cb693c71: Use block comments in snapshots to make them work in all browsers

## 0.5.5

### Patch Changes

- b362288a: make snapshots work on all browsers

## 0.5.4

### Patch Changes

- 270a633a: dynamic import web socket module

## 0.5.3

### Patch Changes

- 3af6ff86: improve snapshot formatting

## 0.5.2

### Patch Changes

- 91e0e617: add compareSnapshot function

## 0.5.1

### Patch Changes

- 339d05f7: add snapshots plugin

## 0.5.0

### Minor Changes

- c3ead4fa: Added support for holding and releasing keys to the sendKeys command. The command now supports two additional actions `down` and `up` which hold down, or release a key. This effectively allows to hold down modifier keys while pressing other keys, which allows key combinations such as `Shift+Tab`.

  @example

  ```ts
  await sendKeys({
    down: 'Shift',
  });
  await sendKeys({
    press: 'Tab',
  });
  await sendKeys({
    up: 'Shift',
  });
  ```

## 0.4.5

### Patch Changes

- 21f53211: add commands for reading/writing files

## 0.4.4

### Patch Changes

- a6a018da: fix type references

## 0.4.3

### Patch Changes

- 1d9411a3: Export `sendKeysPlugin` from `@web/test-runner-commands/plugins`.
  Loosen the typing of the command payload.
- d2389bac: Add a11ySnapshotPlugin to acquire the current accessibility tree from the browser:

  ```js
  import { a11ySnapshot, findAccessibilityNode } from '@web/test-runner-commands';

  // ...

  const nodeName = 'Label Text';
  const snapshot = await a11ySnapshot();
  const foundNode = findAccessibilityNode(snapshot, node => node.name === nodeName);
  expect(foundNode).to.not.be.null;
  ```

## 0.4.2

### Patch Changes

- ce90c7c3: Add the `sendKeys` command

  Sends a string of keys for the browser to press (all at once, as with single keys
  or shortcuts; e.g. `{press: 'Tab'}` or `{press: 'Shift+a'}` or
  `{press: 'Option+ArrowUp}`) or type (in sequence, e.g. `{type: 'Your name'}`) natively.

  For specific documentation of the strings to leverage here, see the Playwright documentation,
  here:

  - `press`: https://playwright.dev/docs/api/class-keyboard#keyboardpresskey-options
  - `type`: https://playwright.dev/docs/api/class-keyboard#keyboardtypetext-options

  Or, the Puppeter documentation, here:

  - `press`: https://pptr.dev/#?product=Puppeteer&show=api-keyboardpresskey-options
  - `type`: https://pptr.dev/#?product=Puppeteer&show=api-keyboardtypetext-options

  @param payload An object including a `press` or `type` property an the associated string
  for the browser runner to apply via that input method.

  @example

  ```ts
  await sendKeys({
    press: 'Tab',
  });
  ```

  @example

  ```ts
  await sendKeys({
    type: 'Your address',
  });
  ```

- Updated dependencies [ce90c7c3]
  - @web/test-runner-core@0.10.14

## 0.4.1

### Patch Changes

- e3314b02: update dependency on core

## 0.4.0

### Minor Changes

- a7d74fdc: drop support for node v10 and v11
- 1dd7cd0e: version bump after breaking change in @web/test-runner-core

### Patch Changes

- Updated dependencies [1dd7cd0e]
- Updated dependencies [a7d74fdc]
  - @web/test-runner-core@0.10.0

## 0.3.0

### Minor Changes

- 6e313c18: merged @web/test-runner-cli package into @web/test-runner

### Patch Changes

- Updated dependencies [6e313c18]
- Updated dependencies [0f613e0e]
  - @web/test-runner-core@0.9.0

## 0.2.1

### Patch Changes

- 416c0d2: Update dependencies
- Updated dependencies [aadf0fe]
  - @web/test-runner-core@0.8.4

## 0.2.0

### Minor Changes

- 2291ca1: replaced HTTP with websocket for server-browser communication

  this improves test speed, especially when a test file makes a lot of concurrent requests
  it lets us us catch more errors during test execution, and makes us catch them faster

### Patch Changes

- Updated dependencies [2291ca1]
  - @web/test-runner-core@0.8.0

## 0.1.6

### Patch Changes

- ab97aa8: publish browser folder
- Updated dependencies [ab97aa8]
  - @web/test-runner-core@0.7.13

## 0.1.5

### Patch Changes

- abf811f: improved error message when session id is missing
- Updated dependencies [431ec8f]
  - @web/test-runner-core@0.7.9

## 0.1.4

### Patch Changes

- 632eb67: export browser and node types

## 0.1.3

### Patch Changes

- ce2a2e6: align dependencies

## 0.1.2

### Patch Changes

- 519e6e2: made the plugins import work on node v10

## 0.1.1

### Patch Changes

- aa65fd1: run build before publishing
- Updated dependencies [aa65fd1]
  - @web/test-runner-core@0.7.1

## 0.1.0

### Minor Changes

- fdcf2e5: Merged test runner server into core, and made it no longer possible configure a different server.

  The test runner relies on the server for many things, merging it into core makes the code more maintainable. The server is composable, you can proxy requests to other servers and we can look into adding more composition APIs later.

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

- 62ff8b2: make tests work on windows
- Updated dependencies [cdddf68]
- Updated dependencies [fdcf2e5]
- Updated dependencies [62ff8b2]
- Updated dependencies [9be1f95]
  - @web/test-runner-core@0.7.0

## 0.0.1

### Patch Changes

- 74cc129: implement commands API
- Updated dependencies [02a3926]
- Updated dependencies [74cc129]
  - @web/test-runner-core@0.6.22
