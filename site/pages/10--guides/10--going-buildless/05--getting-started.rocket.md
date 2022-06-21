```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '10--guides/10--going-buildless/05--getting-started.rocket.md';
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

# Getting Started

At Modern Web, it is our goal to help developers discover buildless workflows, by working closely with the browser rather than lots of complex tooling and abstractions. In this section, we've gathered several tips, tricks, and alternatives to help you discover the browsers native capabilities, and to go buildless.

Over the last several years, web development has become almost synonymous with web _framework_ development. Indeed, the proliferation and popularity of front-end web frameworks has led many in the industry to know more about their framework of choice than they do about the underlying platform.

We feel the best way to become a well-rounded and highly-capable web developer is to focus first on learning what the web platform has to offer with as few frameworks and tools added on top as possible.

[MDN](https://developer.mozilla.org) is an excellent resource for learning web APIs and practices. We recommend [MDN's Getting started with the web](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web) as the foundation of any web development curriculum.

In this section we'd like to show you some buildless approaches and workflows, that might allow you to replace some of your tooling with built-in browser functionalities.

- [Serving](./serving.md)
- [CSS](./css.md)
- [ES Modules](./es-modules.md)
