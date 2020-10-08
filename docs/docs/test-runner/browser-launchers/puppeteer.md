# Test Runner >> Browser Launchers >> Puppeteer ||30

Run tests using [Puppeteer](https://www.npmjs.com/package/puppeteer), using a bundled version of Chromium or Firefox (experimental). Use the [Chrome launcher](./chrome.md) to run tests with a globally installed version of Chrome.

## Usage

When using `@web/test-runner` regularly, you can use puppeteer with the `--puppeteer` and `--browsers` flags:

```
# add the package
npm i --save-dev @web/test-runner-puppeteer

# add the flag
wtr test/**/*.test.js --node-resolve --puppeteer
```

## Troubleshooting

Check the official <a href="https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md" target="_blank">troubleshooting page</a> for help with problems during installation.

## Customizing launcher options

If you want to customize the puppeteer launcher options, you can add the browser launcher in the config.

You can find all possible launch options in the [official documentation](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#puppeteerlaunchoptions)

```js
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

export default {
  browsers: [
    puppeteerLauncher({
      launchOptions: {
        executablePath: '/path/to/executable',
        headless: false,
        args: ['--some-flag'],
      },
    }),
  ],
};
```

## Concurrency

You can override the concurrency of this specific browser launcher

```js
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

export default {
  browsers: [
    puppeteerLauncher({
      concurrency: 1,
    }),
  ],
};
```

## Testing Firefox

Testing Firefox with Puppeteer is still experimental. There is currently no official way to install both chromium and firefox, but you can set this up for your repository by adding a post-install step to your package scripts:

`package.json`:

```json
{
  "scripts": {
    "postinstall": "cd node_modules/puppeteer && PUPPETEER_PRODUCT=firefox node install.js"
  }
}
```

Afterward, you can run your tests with an extra firefox flag:

```
wtr test/**/*.test.js --node-resolve --puppeteer --browsers firefox
```
