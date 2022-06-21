```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/index.rocket.md';
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
export const menuLinkText = 'Guides';
```

# Learning Modern Web

In this section, we help you become confident in building for the modern web.

## Going Buildless

Modern browsers have come a long way, and today are a powerful platform for building websites and applications. Our goal is to work with what's available in the browser first before reaching for custom solutions.

In this section we'd like to show you some buildless approaches and workflows, that might help you replace some of your tooling with built-in browser functionalities.

- [Getting Started](./going-buildless/getting-started.md)
- [Serving](./going-buildless/serving.md)
- [CSS](./going-buildless/css.md)
- [ES Modules](./going-buildless/es-modules.md)

## Web Test Runner

Testing your code is important to have the confidence to release often. When all your tests are passing, that means you're good to go! In this section, we go step by step through different workflows using our test runner.

- [Getting Started](./test-runner/getting-started.md)
- [Watch and debug](./test-runner/watch-and-debug/index.md)
- [Browsers](./test-runner/browsers.md)
- [Responsive](./test-runner/responsive.md)
- [Code Coverage](./test-runner/code-coverage/index.md)

## Dev Server

- [Getting Started](./dev-server/getting-started.md)
- [TypeScript and JSX](./dev-server/typescript-and-jsx.md)
- [Writing Plugins](./dev-server/writing-plugins.md)
