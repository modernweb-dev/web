# storybook-utils

Utilities for Storybook.

## MDXFileLoader

Loads a non-JS file content in MDX and allows to render it.

This is needed for 2 reasons:

- to workaround the limitation of MDX 2 where top-level await is not supported
- to work in browsers where non-standard ESM imports (e.g. imports of text files, CSS and such) are not possible

> In MDX 3 you can just [use the top-level await.](https://mdxjs.com/blog/v3/#await-in-mdx)

### Use-case: render external Markdown file using Storybook `Markdown` block.

Given a Storybook MDX file `docs/my-page.mdx` and a Markdown file `README.md` in the root, use the following MDX code:

```mdx
import { Markdown } from '@storybook/blocks';
import { MDXFileLoader } from '@web/storybook-utils';

<MDXFileLoader
  url={new URL('../README.md', import.meta.url).href}
  render={content => {
    return <Markdown>{content}</Markdown>;
  }}
/>
```

> Make sure to use `@web/rollup-plugin-import-meta-assets` or another alternative to correctly bundle the assets resolved with the help of `import.meta.url`.

## createAddon

Storybook addons are React components.
The `createAddon` function returns a React component that wraps a custom element and passes on properties and events.
This allows for creating addons with web components (and therefore LitElement).

The wrapper can forward specific events to your addon (web component) as they occur.
Your addon can listen for these events.
Some useful Storybook events are forwarded by default (specifically `STORY_SPECIFIED`, `STORY_CHANGED`, `STORY_RENDERED`).
An `options` parameter can be passed to `createAddon` that contains additional events that you may need for your use case.

`api` and `active` are required props when rendering the React component.

```js
// my-addon/manager.js

import React from 'react';
import { STORY_RENDERED } from '@storybook/core-events';
import { addons, types } from '@storybook/manager-api';
import { createAddon } from '@web/storybook-utils';

const { createElement } = React;

class MyAddonElement extends LitElement {
  constructor() {
    super();
    this.addEventListener(STORY_RENDERED, event => {
      // handle Storybook event
    });
    this.addEventListener('my-addon:custom-event-name', event => {
      // handle my custom event
    });
  }

  render() {
    return html`
      <div>
        <!-- my addon template -->
      </div>
    `;
  }
}

customElements.define('my-addon', MyAddonElement);

const MyAddonReactComponent = createAddon('my-addon', {
  events: ['my-addon:custom-event-name'],
});

addons.register('my-addon', api => {
  addons.add('my-addon/panel', {
    type: types.PANEL,
    title: 'My Addon',
    render: ({ active }) => createElement(MyAddonReactComponent, { api, active }),
  });
});
```

```js
// my-addon/decorator.js
import { addons } from '@storybook/preview-api';

// ...
addons.getChannel().emit('my-addon:custom-event-name', {});
// ...
```

Storybook expects only 1 addon to be in the DOM, which is the addon that is selected (active).
This means addons can be continuously connected/disconnected when switching between addons and stories.
This is important to understand to work effectively with LitElement lifecycle methods and events.
Addons that rely on events that might occur when it is not active, should have their event listeners set up in the `constructor`.
Event listeners set up in the `connectedCallback` should always also be disconnected.
