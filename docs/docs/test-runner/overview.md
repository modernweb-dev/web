---
eleventyNavigation:
  key: Test Runner >> Overview
  title: Overview
  parent: Test Runner
  order: 1
---

# Web Test Runner

Test runner for web applications.

👉&nbsp;&nbsp; Headless browsers with [Puppeteer](browser-launchers/puppeteer.md), [Playwright](browser-launchers/playwright.md), [Selenium](browser-launchers/selenium.md) or [WebdriverIO](browser-launchers/webdriver.md). <br>
🚧&nbsp;&nbsp; Reports logs, 404s, and errors from the browser. <br>
🔍&nbsp;&nbsp; Debug opens a real browser window with devtools.<br>
📦&nbsp;&nbsp; Mock es modules using [Import Maps](./writing-tests/mocking.md).<br>
🔧&nbsp;&nbsp; Exposes browser properties like viewport size and dark mode.<br>
⏱&nbsp;&nbsp;Runs tests in parallel and isolation.<br>
👀&nbsp;&nbsp; Interactive watch mode.<br>
🏃&nbsp;&nbsp; Fast development by rerunning only changed tests.<br>
🚀&nbsp;&nbsp; Powered by [esbuild](../dev-server/plugins/esbuild.md) and [rollup plugins](../dev-server/plugins/rollup.md)

## Installation

Install the web test runner:

```
npm i --save-dev @web/test-runner
```

Then add the following to the `"scripts"` section in `package.json`:

```
"test": "web-test-runner test/**/*.test.js --node-resolve"
```

Or use the shorthand:

```
"test": "wtr test/**/*.test.js --node-resolve"
```

Note, the examples below assume an npm script is used.

## Basic commands

Do a single test run:

```
web-test-runner test/**/*.test.js --node-resolve
wtr test/**/*.test.js --node-resolve
```

Run in watch mode, reloading on file changes:

```
web-test-runner test/**/*.test.js --node-resolve --watch
wtr test/**/*.test.js --node-resolve --watch
```

Run with code coverage profiling (this is slower):

```
web-test-runner test/**/*.test.js --node-resolve --coverage
wtr test/**/*.test.js --node-resolve --coverage
```

Transform JS to a compatible syntax based on user agent:

```
web-test-runner test/**/*.test.js --node-resolve --esbuild-target auto
wtr test/**/*.test.js --node-resolve --esbuild-target auto
```

## Guide

Check out this [step by step guide](../../guides/test-runner/getting-started.md) to get started.

## Example projects

Check out the <a href="https://github.com/modernweb-dev/example-projects" target="_blank" rel="noopener noreferrer">example projects</a> for a fully integrated setup.
