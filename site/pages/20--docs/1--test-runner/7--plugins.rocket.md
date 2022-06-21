```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/1--test-runner/7--plugins.rocket.md';
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

# Plugins

The test runner uses `@web/dev-server` to your test files to the browser. The dev server has many configuration options, a plugin system to do code transformations, and middleware to change the server's behavior.

We recommend reading these pages:

- [Plugins](../dev-server/plugins/overview.md) for a general overview
- [esbuild](../dev-server/plugins/esbuild.md) for TS, JSX and TSX
- [rollup](../dev-server/plugins/rollup.md) for using rollup plugins
- [Writing plugins](../dev-server/writing-plugins/overview.md)
