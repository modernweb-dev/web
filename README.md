<p align="center"><img src="./assets/logo.png" width="60%"/></p>

<h3 align="center">Developer tools for modern web development.</h3>

Modern browsers are a powerful platform for building websites and applications. Our goal is to teach developers what's available in the browser out of the box, and provide extensions in the form of patterns and tooling.

By building on top of established standards we can create solutions that are lightweight, easy to learn and remain relevant for a longer time.

## open-wc

Modern Web is a branch off from and started by the same team behind [open-wc](https://github.com/open-wc/open-wc/). For more information, [see this issue](https://github.com/open-wc/open-wc/issues/1681) at the open-wc repository.

## Test runner and dev server

### Main packages

The main packages are the "opinionated" implementations of the test runner and dev server. Implementing a CLI and a good set default.

- [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner).
- `@web/dev-server` (coming soon!)

### Code transformation

Plugins for transforming code in the dev server and test runner.

- [@web/dev-server-rollup](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-rollup)
- [@web/dev-server-esbuild](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-esbuild)
- [@web/dev-server-legacy](https://github.com/modernweb-dev/web/tree/master/packages/dev-server-legacy)

### Browser launchers

Different implementations for controlling the browser to run tests in.

- [@web/test-runner-chrome](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-chrome)
- [@web/test-runner-puppeteer](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-puppeteer)
- [@web/test-runner-playwright](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-playwright)
- [@web/test-runner-selenium](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-selenium)
- [@web/test-runner-browserstack](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-browserstack)

### Test frameworks

Frameworks to run tests in the browser.

- [@web/test-runner-mocha](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-mocha)

### Testing helpers

Helper libraries for writing tests.

- [@web/test-runner-commands](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-commands)

### Other packages

Other packages implementing the low level parts. You will likely not use these directly, unless you're implementing your own tooling.

- [@web/test-runner-core](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-core)
- [@web/test-runner-cli](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-cli)
- [@web/test-runner-server](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-server)
- [@web/test-runner-coverage-v8](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-coverage-v8)

[![Testing Powered By SauceLabs](https://opensource.saucelabs.com/images/opensauce/powered-by-saucelabs-badge-white.png?sanitize=true 'Testing Powered By SauceLabs')](https://saucelabs.com)
