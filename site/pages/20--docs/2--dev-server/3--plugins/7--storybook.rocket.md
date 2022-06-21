```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/2--dev-server/3--plugins/7--storybook.rocket.md';
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

# Storybook

Plugin for using Storybook with Web Dev Server using es modules.

## How it works

This plugin uses an [opinionated build](https://github.com/modernweb-dev/storybook-prebuilt) of Storybook, making it possible to use it with Web Dev Server for es modules and buildless workflows.

This build installs a default set of addons:

- Actions
- Backgrounds
- Controls
- Docs
- Viewport
- Toolbars

It's not possible to install other addons at the moment.

## Usage

Follow the [Dev Server Storybook guide](../../../guides/dev-server/storybook.md) to learn how to set up the plugin.

Follow the [official storybook docs](https://storybook.js.org/) to learn how to use storybook and create stories.

## Docs

This plugin supports docs written using the storybook MDX format. To import doc blocks, import them from the prebuilt:

Regular storybook:

```js
import { Meta, Story, Canvas, ArgsTable } from '@storybook/addon-docs/blocks';
```

Storybook prebuilt:

```js
import { Meta, Story, Canvas, ArgsTable } from '@web/storybook-prebuilt/addon-docs/blocks.js';
```

Follow the regular storybook docs to learn how to create docs.

## Configuration

### Project types

We currently support `preact` and `web-components` project types. This corresponds to the Storybook "Framework".

Other project types could be supported, let us know if you are interested in this.

### main.js and preview.js

We read the `.storybook/main.js` and `.storybook/preview.js` files like regular storybook.

### Customizing storybook directory

You can customize the storybook directory when instantiating the plugin:

```js
import { storybookPlugin } from '@web/dev-server-storybook';

export default {
  plugins: [storybookPlugin({ type: 'web-components', configDir: 'custom-directory' })],
};
```

## Production build

You can run a build on your storybook demo before shipping it to production. Regular storybook uses webpack, which might require considerable configuration to make it work for the buildless storybook. To keep the build simple we are using Rollup.

### Running a build

To run a production build, execute the `build-storybook` command. This takes a few parameters:

| name       | type   | description                                                            |
| ---------- | ------ | ---------------------------------------------------------------------- |
| config-dir | string | Directory to read storybook config from. defaults to `.storybook`      |
| output-dir | string | Directory to write the build output to. defaults to `storybook-static` |
| type       | string | Project type. Defaults to `web-components`                             |

### Customizing the build

You can customize the rollup config from your `main.js` config:

```js
const pluginA = require('rollup-plugin-a');
const pluginB = require('rollup-plugin-b');

module.exports = {
  rollupConfig(config) {
    // add a new plugin to the build
    config.plugins.push(pluginA());

    // use unshift to make sure it runs before other plugins
    config.plugins.unshift(pluginB());

    return config;
  },
};
```
