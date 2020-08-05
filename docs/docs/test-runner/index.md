---
title: Test Runner
eleventyNavigation:
  key: Test Runner
  order: 10
---

> This project is in beta. We are looking for people to test it out, and let us know about issues and what they think about it.

The test runner for web applications.

👉&nbsp;&nbsp; Headless browsers with puppeteer, playwright, or selenium. <br>
🚧&nbsp;&nbsp; Reports logs, 404s, and errors from the browser. <br>
📦&nbsp;&nbsp; Supports native es modules.<br>
🔧&nbsp;&nbsp; Runs tests in parallel and isolation.<br>
👀&nbsp;&nbsp; Interactive watch mode.<br>
🏃&nbsp;&nbsp; Reruns only changed tests.<br>
🚀&nbsp;&nbsp; Powered by [esbuild](../dev-server/esbuild.md) and [rollup plugins](../dev-server/rollup.md)

## Example projects

Check out these example projects for a full setup.

- [lit-element](https://github.com/modernweb-dev/web/tree/master/demo/projects/lit-element)
- [lit-element typescript](https://github.com/modernweb-dev/web/tree/master/demo/projects/lit-element-ts)
- [preact htm](https://github.com/modernweb-dev/web/tree/master/demo/projects/preact-htm)
- [preact jsx](https://github.com/modernweb-dev/web/tree/master/demo/projects/preact-jsx)
- [preact tsx](https://github.com/modernweb-dev/web/tree/master/demo/projects/preact-tsx)

# Web Test Runner Core

Core package for Web Test Runner. Manages running the tests. Has a modular architecture, delegating most of the work to the separate parts and implementations.

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.

## Browser launchers

Browser launchers boot up and control a browser instance. Implementations:

- [@web/test-runner-chrome](./chrome.md)
- [@web/test-runner-puppeteer](./puppeteer.md)
- [@web/test-runner-playwright](./playwright.md)
- [@web/test-runner-selenium](./selenium.md)
- [@web/test-runner-browserstack](./browserstack.md)

[Read more here](./docs/browser-launcher.md) to learn about creating your own browser launcher.

## Test frameworks

Test frameworks run the actual tests in the browser. Web test runner relies on existing test frameworks. Implementations:

- [@web/test-runner-mocha](./mocha.md)

[Read more here](./browser-lib.md) to learn more about using the browser library without a testing framework, or to implement your own testing framework.

## Servers

The server serves the test code and files and communicates with the browser, returning configuration and receiving test results. Implementations:

- [@web/test-runner-server](./server.md)

[Read more here](./docs/dev-server.md) to learn about creating your own test runner server.

## Learn More

See more at [Overview](./overview.md).
