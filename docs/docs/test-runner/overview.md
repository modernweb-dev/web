---
title: Web Test Runner
eleventyNavigation:
  key: Overview
  parent: Test Runner
  order: 1
---

Test runner for web applications.

👉&nbsp;&nbsp; Headless browsers with [Puppeteer](https://modern-web.dev/docs/test-runner/browsers/puppeteer/), [Playwright](https://modern-web.dev/docs/test-runner/browsers/playwright/), or [Selenium](https://modern-web.dev/docs/test-runner/browsers/selenium/). <br>
🚧&nbsp;&nbsp; Reports logs, 404s, and errors from the browser. <br>
🔍&nbsp;&nbsp; Debug opens a real browser window with devtools.<br>
🔧&nbsp;&nbsp; Exposes browser properties like viewport size and dark mode.<br>
⏱&nbsp;&nbsp;Runs tests in parallel and isolation.<br>
👀&nbsp;&nbsp; Interactive watch mode.<br>
🏃&nbsp;&nbsp; Fast development by rerunning only changed tests.<br>
🚀&nbsp;&nbsp; Powered by [esbuild](https://modern-web.dev/docs/dev-server/esbuild.md) and [rollup plugins](https://modern-web.dev/docs/dev-server/rollup.md)

## Getting started

### Installation

Install the test runner:

```bash
npm i -D @web/test-runner
```

### Basic commands

Do a single test run:

```bash
web-test-runner test/**/*.test.js --node-resolve
wtr test/**/*.test.js --node-resolve
```

Run in watch mode, reloading on file changes:

```bash
web-test-runner test/**/*.test.js --node-resolve --watch
wtr test/**/*.test.js --node-resolve --watch
```

Run with code coverage profiling (this is slower):

```bash
web-test-runner test/**/*.test.js --node-resolve --coverage
wtr test/**/*.test.js --node-resolve --coverage
```

### Guide

Check out this [step by step guide](../../../learn/test-runner/getting-started.md) to get started.

### Example projects

Check out the <a href="https://github.com/modernweb-dev/example-projects" target="_blank" rel="noopener noreferrer">example projects</a> for a fully integrated setup.
