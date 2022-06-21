```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/20--test-runner/70--typescript.rocket.md';
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

# Testing TypeScript

If you write your source files in TypeScript, you can test directly from sources without
compiling using `tsc`. Add `esbuildPlugin({ ts: true })` to your `web-test-runner.config.js`
file.
This uses esbuild to [transform TS sources on-the-fly](https://esbuild.github.io/api/#transform-api).
[There are some caveats to using esbuild with TypeScript](https://esbuild.github.io/content-types/#typescript-caveats).
For example, if you use TypeScript paths to alias imports, You may need to build first.

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
  plugins: [esbuildPlugin({ ts: true })],
};
```

Keep in mind that esbuild merely removes TypeScript syntax and transforms decorators, etc;
It does not provide any type checking, and it's [not intended to](https://esbuild.github.io/faq/#upcoming-roadmap). If you'd like to run `tsc` in parallel, you can use `concurrently` or `npm-run-all`

<figure>

```bash
concurrently --kill-others --names tsc,wtr \"npm run tsc:watch\" \"wtr --watch\"
```

<figcaption>

Example: Using `concurrently` to typecheck and test simultaneously

</figcaption>

</figure>

Read more about the esbuild plugin in the [docs](../../docs/dev-server/plugins/esbuild.md)
