```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/20--test-runner/60--dev-server.rocket.md';
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

# Dev Server

Web Test Runner is based on Web Dev Server and shares the same configuration.

You can view the dev server documentation to learn how to set this up.

**Guides:**

- [Using plugins](../dev-server/using-plugins.md)
- [Typescript and JSX](../dev-server/typescript-and-jsx.md)
- [Browser support](../dev-server/browser-support.md)

**Documentation:**

- [Configuration](../../docs/dev-server/cli-and-configuration.md)
- [Middleware](../../docs/dev-server/middleware.md)
- [Rollup plugin](../../docs/dev-server/plugins/rollup.md)
- [Esbuild plugin](../../docs/dev-server/plugins/esbuild.md)
