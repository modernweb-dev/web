```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '30--blog/index.rocket.md';
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
export const menuLinkText = 'Blog';
```

# Modern Web Blog

Discover articles from the core team and contributors about Modern Web, tips, and tricks included!

Do you want to write a blog post, or want us to write about a specific topic? [Suggest it!](https://github.com/modernweb-dev/web/issues/new?title=[blog%20post]%20Write%20about%20...&labels=blog%20post&body=I%20would%20like%20to%20write%20about...)

_Note: blog posts may age while our guides & docs section will always be up to date_
