# Web Test Runner Chrome

Browser launcher for `@web/test-runner`. Looks for a locally installed instance of Chrome, and controls it using [puppeteer-core](https://www.npmjs.com/package/puppeteer-core). This avoids the postinstall step of `puppeteer` or `playwright`, speeding up installation of projects.

If you don't want to install Chrome globally, for example in a CI environment, you can use [@web/test-runner-puppeeteer](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-puppeteer) or [@web/test-runner-playwright](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-playwright)

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.
