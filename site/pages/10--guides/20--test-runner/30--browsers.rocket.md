```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/20--test-runner/30--browsers.rocket.md';
import { html, layout, setupUnifiedPlugins, components } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
/* END - Rocket auto generated - do not touch */
```

# Browsers

Browser launchers are responsible for opening and controlling the actual browser.

By default, the test runner will look for a globally installed Chrome on your computer.

## Testing with Puppeteer

You can run tests with puppeteer, which will download a local instance of Chromium instead of relying on a globally installed version of Chrome.

First, install the package:

```
npm i --save-dev @web/test-runner-puppeteer
```

Then, add the `--puppeteer` in your `package.json`:

```json
{
  "scripts": {
    "test": "wtr \"test/**/*.test.js\" --node-resolve --puppeteer"
  }
}
```

## Testing in all evergreen browsers

[Playwright](https://github.com/microsoft/playwright) is a great tool by Microsoft that allows us to run tests in all evergreen browsers.

If you want to make use of this, you can do so by following these instructions:

```
npm i --save-dev @web/test-runner-playwright
```

This will locally install the required versions of Chromium, Firefox, and WebKit. Once installation is done, we can specify which browsers we want to actually make use of in our `package.json` script:

```json
"test": "web-test-runner \"test/**/*.test.js\" --node-resolve --playwright --browsers chromium firefox webkit",
```

Now all we need to do is run our tests:

```
$ yarn test
$ web-test-runner "test/**/*.test.js" --node-resolve --playwright --browsers chromium firefox webkit

Chromium: |██████████████████████████████| 2/2 test files | 3 passed, 0 failed
Firefox:  |██████████████████████████████| 2/2 test files | 3 passed, 0 failed
Webkit:   |██████████████████████████████| 2/2 test files | 3 passed, 0 failed

Finished running tests in 3.4s, all tests passed! 🎉
```

As you can see, we've executed 2 test files in 3 different real browsers.
If all your tests are green you can't get any more confident about your code. So let's ship it!

## Using Browserstack

For modern browsers we recommend using other browser launchers, as they are a lot faster. Browserstack can be used to target older browser versions. Check the [docs](../../docs/test-runner/browser-launchers/browserstack.md) to learn how to set it up.

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/test-runner).
See the [documentation of @web/test-runner](../../docs/test-runner/overview.md).
