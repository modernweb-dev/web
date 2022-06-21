```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/1--test-runner/8--reporters/20--junit.rocket.md';
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

# JUnit

JUnit XML reporter for web test runner

## Configuration

Web test runner JUnit reporter accepts two options:

| Option       | Type    | Default                | Description                                                                       |
| ------------ | ------- | ---------------------- | --------------------------------------------------------------------------------- |
| `outputPath` | string  | `'./test-results.xml'` | file path (including extension) to write results to. Will be resolved from `cwd`. |
| `reportLogs` | boolean | `false`                | Whether to report browser logs in the xml file's `system-out` element             |

## Example

```js
import { defaultReporter } from '@web/test-runner';
import { junitReporter } from '@web/test-runner-junit-reporter';

export default {
  nodeResolve: true,
  reporters: [
    // use the default reporter only for reporting test progress
    defaultReporter({ reportTestResults: false, reportTestProgress: true }),
    // use another reporter to report test results
    junitReporter({
      outputPath: './results/test-results.xml', // default `'./test-results.xml'`
      reportLogs: true, // default `false`
    }),
  ],
};
```
