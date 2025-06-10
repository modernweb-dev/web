# Test Runner >> Testing in a CI ||9

It's possible to use the test runner in a CI, but because it runs tests on a real browser you need to ensure the CI environments can support it.

The test runner uses `@web/test-runner-chrome` by default which looks for a locally installed Chrome. For your CI you can look for an image which installs Chrome to run your tests.

## Puppeteer

You can also use `@web/test-runner-puppeteer` which downloads it's own compatible version of Chromium. This is more convenient, and can be more stable as well.

Puppeteer has a [dedicated page](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md) on troubleshooting in general, and contains section on using puppeteer in a CI environment.

## Playwright

If you want to use `@web/test-runner-playwright` in a CI environment you need to ensure the necessary native libraries are installed.

For the modern web repositories, we run our tests on GitHub Actions using the [Playwright CLI](https://playwright.dev/docs/next/cli#install-system-dependencies).

Check the [official documentation](https://playwright.dev/docs/next/ci#ci-configurations) for more information on different CI environments.
