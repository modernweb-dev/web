```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/30--dev-server/50--typescript-and-jsx.rocket.md';
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

# TypeScript and JSX

## JSX

To use JSX in Web Dev Server and Web Test Runner we recommend the [esbuild plugin](../../docs/dev-server/plugins/esbuild.md). It's great for transforming JSX to JS on the fly.

To use the plugin, install it, and add the plugin to your configuration. The `jsx: true` option will process all `.jsx` files automatically.

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [
    esbuildPlugin({
      jsx: true,
      // optional JSX factory and fragment
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
  ],
};
```

If you want to process JSX in `.js` files you can configure the loader explicitly:

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [
    esbuildPlugin({
      loaders: { '.js': 'jsx' },
      // optional JSX factory and fragment
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
  ],
};
```

## Typescript

### TSC

To use Typescript we recommend the official typescript compiler (TSC). It is the most predictable when it comes to compiling typescript.

To use both TSC and Web Dev Server or Web Test Runner in the same terminal, you can use the `--preserveWatchOutput` option to avoid both tools clearing the terminal on change.

To run both commands on a unix system:

```
tsc --watch --preserveWatchOutput & web-dev-server --watch
tsc --watch --preserveWatchOutput & web-test-runner --watch
```

You can use [concurrently](https://www.npmjs.com/package/concurrently) for a cross-platform solution. For Web Test Runner, you need to use the `--raw` flag to allow interacting with the watch menu.

```
concurrently --raw "tsc --watch --preserveWatchOutput" "wds --watch"
concurrently --raw "tsc --watch --preserveWatchOutput" "wtr --watch"
```

Remember to use source maps for easier debugging.

### Esbuild

As an alternative to TSC, the [esbuild plugin](../../docs/dev-server/plugins/esbuild.md) can be used to compile typescript on the fly as well. The benefit of this approach is that it is faster, and you don't need to run two separate tools. The downside is that esbuild doesn't do any type checking, it only strips types.

To use the plugin, install it and add the plugin to your configuration. The `ts: true` option handles all `.ts` files automatically.

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  plugins: [esbuildPlugin({ ts: true })],
};
```

To keep type checking as part of your workflow, you can use TSC as a code linting tool using the `--noEmit` flag.

```
tsc --noEmit
```

## JS Syntax

The esbuild [JS loader](https://esbuild.github.io/content-types/#javascript) has options available for modern JS syntax not yet available in all browsers, or only in the latest versions. You can configure the language target using the `target` option.

See the [browser support guide](./browser-support.md) on how to set this up.

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/dev-server).
See the [documentation of @web/dev-server](../../docs/dev-server/overview.md).
