---
"@web/mocks": minor
---

Adds support for node.js request mocking, as well as some breaking changes:

1. Add support for request mocking in node js via `@web/mocks/node.js`
2. rename `rest` to `http` -> not all requests/apis are RESTful, but all requests are http requests
3. `withMocks()` to `withMocks` (no function call)
4. move plugins from `node.js` to `plugins.js`
5. separate `registerMockRoutes` from loading storybook code; when using `registerMockRoutes` in tests, we dont need to import storybook code
6. remove `./msw.js`, moved into `browser.js` directly
7. moved `storybook-decorator.js` to `@web/mocks/storybook/decorator.js`, this also leaves some space for the storybook UI addon (`@web/mocks/storybook/addon.js`), and if we decide to move the `storyFixture` (`@web/mocks/storybook/fixture.js`) in here as well
