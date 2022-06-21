```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/2--dev-server/1--overview.rocket.md';
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

```js server
export const menuLinkText = 'Dev Server >> Overview';
```

# Web Dev Server

Web Dev Server helps developing for the web, using native browser features like es modules. It is ideal for buildless workflows, and has a plugin architecture for light code transformations.

- Efficient browser caching for fast reloads
- Transform code on older browsers for compatibility
- Resolve bare module imports for use in the browser (--node-resolve)
- Auto-reload on file changes with the (--watch)
- History API fallback for SPA routing (--app-index index.html)
- Plugin and middleware API for extensions
- Powered by [esbuild](plugins/esbuild.md) and [rollup plugins](plugins/rollup.md)

> Web Dev Server is the successor of [es-dev-server](https://www.npmjs.com/package/es-dev-server)

## Installation

Install Web Dev Server:

```
npm i --save-dev @web/dev-server
```

Then add the following to the `"scripts"` section in `package.json`:

```
"start": "web-dev-server --node-resolve --open --watch"
```

Or use the shorthand:

```
"start": "wds --node-resolve --open --watch"
```

Note, the examples below assume an npm script is used.

## Basic commands

Start the server:

```
web-dev-server --node-resolve --open
wds --node-resolve --open
```

Run in watch mode, reloading on file changes:

```
web-dev-server --node-resolve --watch --open
wds --node-resolve --watch --open
```

Use history API fallback for SPA routing:

```
web-dev-server --node-resolve --app-index demo/index.html --open
wds --node-resolve --app-index demo/index.html --open
```

Transform JS to a compatible syntax based on user agent:

```
web-dev-server --node-resolve --open --esbuild-target auto
wds --node-resolve --open --esbuild-target auto
```

## Example projects

Check out the <a href="https://github.com/modernweb-dev/example-projects" target="_blank" rel="noopener noreferrer">example projects</a> for a fully integrated setup.
