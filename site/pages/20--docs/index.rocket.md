```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/index.rocket.md';
import { html, layout, setupUnifiedPlugins, components } from '../recursive.data.js';
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

```js server
export const menuLinkText = 'Docs';
```

# Documentation

Our documentation is hand crafted and optimized to serve as a dictionary to look up details once the need arises.

For a more guided learning experience please visit our [Guides](../guides/index.md).

Documentation for the following packages is available:

- [Web Test Runner](./test-runner/overview.md)
- [Web Dev Server](./dev-server/overview.md)
