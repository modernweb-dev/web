---
title: Using different launchers
eleventyNavigation:
  key: Using Launchers
  parent: Test Runner
  order: 30
---

The launcher is responsible for opening and controlling the actual browser.
The default launcher will use the currently installed chrome version.
You may want to use a different launcher.

## Using playwright to run in chromium, firefox and webkit

If we want to run tests in all evergreen browser then [Microsoft Playwright](https://github.com/microsoft/playwright) might be for us.

We can install it via

```bash
npm i -D @web/test-runner-playwright
```

which will bring its on versions of chromium, firefox, and WebKit.

Once that is available we will activate via some flags in the command of the `packages.json`.

```json
"test": "web-test-runner \"test/**/*.test.js\" --node-resolve --playwright --browsers chromium firefox webkit",
```

Now all that is left to start this bad boy.

```
$ yarn test
$ web-test-runner "test/**/*.test.js" --node-resolve --playwright --browsers chromium firefox webkit

Chromium: |██████████████████████████████| 2/2 test files | 3 passed, 0 failed
Firefox:  |██████████████████████████████| 2/2 test files | 3 passed, 0 failed
Webkit:   |██████████████████████████████| 2/2 test files | 3 passed, 0 failed

Finished running tests in 3.4s, all tests passed! 🎉
```

We execute 2 test files in 3 different real browsers.
If everything is green you can't get any more confident about your code. So ship it.

## Using Puppeteer to run in chrome, firefox

You can run tests with puppeteer, which will download its a local instance of Chromium instead of relying on a globally installed version of Chrome.

```bash
# add the package
npm i -D @web/test-runner-puppeteer

# add the flag
wtr test/**/*.test.js --node-resolve --puppeteer
```

## Using Browserstack

For modern browsers we recommend using other browser launchers, as they are a lot faster. Browserstack can be used to target older browser versions.
