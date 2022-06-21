```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '20--docs/1--test-runner/3--writing-tests/10--js-tests.rocket.md';
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

# JS Tests

Javascript files are loaded by the test framework that is configured. The default test framework is mocha, which loads your test as a standard browser es module. You can use module imports to import your code and any modules you want to use for testing.

For example:

```js
import { expect } from '@esm-bundle/chai';
import { myFunction } from '../src/myFunction.js';

describe('myFunction', () => {
  it('adds two numbers together', () => {
    expect(myFunction(1, 2)).to.equal(3);
  });
});
```

See the [Test frameworks](../test-frameworks/index.md) and [es modules](../../../guides/going-buildless/es-modules.md) sections for more information.
