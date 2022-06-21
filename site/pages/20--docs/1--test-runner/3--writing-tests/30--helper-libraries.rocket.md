```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '20--docs/1--test-runner/3--writing-tests/30--helper-libraries.rocket.md';
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

# Helper Libraries

Not all helper libraries ship es modules which are usable in the browser. On this page we collect libraries which are available as es modules. If need to use a library with another module format, you can follow the instructions at the bottom of the [es modules page](../../../guides/going-buildless/es-modules.md)

## General libraries

[@open-wc/testing](https://github.com/open-wc/open-wc/tree/master/packages/testing) is a general-purpose library, including assertions via chai, HTML test fixtures, a11y tests, and test helpers. It is an opinionated implementation that brings together multiple libraries.

## Assertions

[chai](https://www.npmjs.com/package/chai) is a popular assertion library. It doesn't ship an es module, but you can use [@esm-bundle/chai](https://www.npmjs.com/package/@esm-bundle/chai) for that.

```js
import { expect } from '@esm-bundle/chai';

expect(undefined).to.not.be.a('function');
```

## Chai plugins

- [@open-wc/chai-dom-equals](https://www.npmjs.com/package/@open-wc/chai-dom-equals) for diffing HTML
- [chai-a11y-axe](https://www.npmjs.com/package/chai-a11y-axe) for testing accessibility

## Testing helpers

[@open-wc/testing-helpers](https://www.npmjs.com/package/@open-wc/testing-helpers) contains useful helper functions for setting up snippets of HTML test fixtures, and testing async behavior

## Mocking

For stubbing and mocking, we recommend [sinon](https://www.npmjs.com/package/sinon). Check the [mocking page](./mocking.md) for more.
