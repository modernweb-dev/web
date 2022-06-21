```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/30--dev-server/10--getting-started.rocket.md';
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

Web Dev Server helps developing for the web, using native browser features like es modules. It is ideal for buildless workflows and has a plugin architecture for light code transformations.

> Web Dev Server is the successor of [es-dev-server](https://www.npmjs.com/package/es-dev-server)

## Working with Web Dev Server

At its core, the dev server acts like a static file server. It tries to not get in the way of regular browser behavior. Additional functionalities are additive, enabled via flags or commands.

## Installing the server

To get started we first need to install the server:

```
npm i --save-dev @web/dev-server
```

We can then run it using the `web-dev-server` or `wds` command.

To view all the available commands, use the `--help` flag or view the [complete docs](../../docs/dev-server/overview.md).

```
npx web-dev-server --help
```

## Creating a simple page

Let's create a simple demo page for our project called `demo/index.html`.

Add the following content:

```html
<!DOCTYPE html>
<html>
  <body>
    Hello world!
  </body>
</html>
```

To view this page with the dev server, we run the command with the `--open` flag and point it to the demo page:

```
npx web-dev-server --open /demo/
```

This should show `Hello world!` on the page.

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/dev-server).
See the [documentation of @web/dev-server](../../docs/dev-server/overview.md).
