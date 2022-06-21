```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/2--dev-server/3--plugins/1--overview.rocket.md';
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

# Overview

Web Dev Server comes with a few plugins out of the box.

See

- [esbuild](./esbuild.md)
- [rollup](./rollup.md)
- [import-maps](./import-maps.md)
- [legacy](./legacy.md)
- [hmr](./hmr.md)

If you have more specific needs it's best to [write your own plugin](../writing-plugins/overview.md).
