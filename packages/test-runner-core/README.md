# Web Test Runner Core

Core package for Web Test Runner. Managing running the tests. Has a modular architecture, delegating most of the work to separate implementations.

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation.

## Browser launchers

Browser launchers boot up and control a browser instance. Implementations:

- [@web/test-runner-chrome](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-chrome)
- [@web/test-runner-puppeteer](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-puppeteer)
- [@web/test-runner-playwright](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-playwright)
- `@web/test-runner-selenium` (coming soon)
- `@web/test-runner-browserstack` (coming soon)

## Servers

The server serves the test code and files and communicates with the browser, returning configuration and receiving test results. Implementations:

- [@web/test-runner-dev-server](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-dev-server)

## Test framework

Test frameworks run the actual tests in the browser. Web test runner relies on existing test frameworks. Implementations

- [@web/test-runner-mocha](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-mocha)

Further documentation is still a work in progress.
