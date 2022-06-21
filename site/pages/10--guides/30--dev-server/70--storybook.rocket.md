```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/30--dev-server/70--storybook.rocket.md';
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

# Storybook

[Storybook](https://storybook.js.org/) is a great tool for developing and demoing components. By default, it is based on Webpack and Webpack dev server.

The [@web/dev-server-storybook](../../docs/dev-server/plugins/storybook.md) plugin uses an [opinionated build](https://github.com/modernweb-dev/storybook-prebuilt) of Storybook, making it possible to use it with Web Dev Server for es modules and buildless workflows.

## Setup

Install the package:

```
npm i --save-dev @web/dev-server-storybook
```

Add the plugin and set the project type. See below for supported project types.

```js
import { storybookPlugin } from '@web/dev-server-storybook';

export default {
  // type can be 'web-components' or 'preact'
  plugins: [storybookPlugin({ type: 'web-components' })],
};
```

Add a `.storybook/main.js` file:

```js
module.exports = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
};
```

Add a story: `stories/MyButton.stories.js`:

```js
export default {
  title: 'Example/Button',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

const Button = ({ backgroundColor = 'white', text }) => {
  return `
    <button type="button" style="background-color: ${backgroundColor}">
      ${text}
    </button>
  `;
};

export const ButtonA = Button.bind({});
ButtonA.args = {
  text: 'Button A',
};

export const ButtonB = Button.bind({});
ButtonB.args = {
  text: 'Button B',
};
```

See the [plugin documentation](../../docs/dev-server/plugins/storybook.md) for more features and all configuration options.

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/dev-server).
See the [documentation of @web/dev-server](../../docs/dev-server/overview.md).
