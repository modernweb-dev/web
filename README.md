<p align="center"><img src="./assets/logo.png" width="60%"/></p>

<h3 align="center">Developer tools for modern web development.</h3>

### Low barrier to entry

We provide tooling that is easy to get into and requires as little prerequisite knowledge as possible. No longer do you need a degree in Webpack to deploy an application.

### Performant

Both from a speed and size perspective, we focus on tooling that helps create performant products and services.

### Close to the platform

Following platform will ensure that your knowledge and skills learnt, remain relevant over time. Frameworks may come and go, but the platform stays.
This means that we value platform solutions over tooling that goes into the opposite direcction.

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

### Other packages

Other packages implementing the low level parts. You will likely not use these directly, unless you're implementing your own tooling.

- [@web/test-runner-core](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-core)
- [@web/test-runner-cli](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-cli)
- [@web/test-runner-browser-lib](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-browser-lib)
- [@web/test-runner-server](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-server)
- [@web/test-runner-coverage-v8](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-coverage-v8)
