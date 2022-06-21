```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '20--docs/1--test-runner/5--browser-launchers/90--write-your-own.rocket.md';
import { html, layout, setupUnifiedPlugins, components } from '../../../recursive.data.js';
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

# Write Your Own

A browser launcher handles booting up or connecting to a browser, visiting a URL and closing the browser when tests finish.

If you want to implement your own browser launcher, it's best to look at the [interface in the source code](https://github.com/modernweb-dev/web/blob/master/packages/test-runner-core/src/browser-launcher/BrowserLauncher.ts).

For a reference implementation, you can take a look at [@web/test-runner-chrome](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-chrome).
