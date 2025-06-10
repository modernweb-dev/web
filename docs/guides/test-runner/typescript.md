# Test Runner >> Testing TypeScript || 70

If you write your source files in TypeScript, you can test directly from sources without
compiling using `tsc`. Add `esbuildPlugin({ ts: true })` to your `web-test-runner.config.js`
file.

This uses esbuild to [transform TS sources on-the-fly](https://esbuild.github.io/api/#transform-api).
[There are some caveats to using esbuild with TypeScript](https://esbuild.github.io/content-types/#typescript-caveats).

For example, if you use TypeScript paths to alias imports, you may need to build first.

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
  plugins: [esbuildPlugin({ ts: true })],
};
```

Keep in mind that esbuild merely removes TypeScript syntax and transforms decorators, etc.;
It does not provide any type checking and it's [not intended to](https://esbuild.github.io/faq/#upcoming-roadmap). If you'd like to run `tsc` in parallel, you can use `concurrently` or `npm-run-all`.

<figure>

```bash
concurrently --kill-others --names tsc,wtr \"npm run tsc:watch\" \"wtr --watch\"
```

<figcaption>

Example: Using `concurrently` to typecheck and test simultaneously

</figcaption>

</figure>

Read more about the esbuild plugin in the [docs](../../docs/dev-server/plugins/esbuild.md).
