```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'about.rocket.md';
import { html, layout, setupUnifiedPlugins, components } from './recursive.data.js';
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
export const menuNoLink = true;
```

# About Modern Web

> Our goal is to provide developers with the guides and tools they need to build for the modern web. We aim to work closely with the browser and avoid complex abstractions.

Modern browsers are a powerful platform for building websites and applications. We try to work with what's available in the browser first before reaching for custom solutions.

When you're working _with_ the browser rather than against it, code, skills, and knowledge remain relevant for a longer time. Development becomes faster and debugging is easier because there are fewer layers of abstractions involved.

At the same time, we are aware of the fact that not all problems can be solved elegantly by the browser today. We support developers making informed decisions about introducing tools and customizations to their projects, in such a way that developers can upgrade later as browser support improves.

## Modern Web Family

The Modern Web Family consists of:

- [modern-web.dev](https://modern-web.dev) with the `@web` npm namespace
- [open-wc.org](https://open-wc.org) with the `@open-wc` npm namespace
