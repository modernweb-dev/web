```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/1--test-runner/8--reporters/30--summary.rocket.md';
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

# Summary

Mocha-style summary reporter for Web Test Runner

## Configuration

Web test runner summary reporter accepts a single option:

| Option    | Type    | Default | Description                                         |
| --------- | ------- | ------- | --------------------------------------------------- |
| `flatten` | boolean | `false` | When true, reports the full suite name on each line |

## Example

```js
import { summaryReporter } from '@web/test-runner';

export default {
  nodeResolve: true,
  reporters: [summaryReporter()],
};
```
