# @web/storybook-addon-mocks

Storybook addon for `@web/mocks`.

## Setup addon

Add `@web/storybook-addon-mocks` to addons in the main Storybook configuration file:

```js
// .storybook/main.js
/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
  addons: ['@web/storybook-addon-mocks'],
  framework: {
    name: '@web/storybook-framework-web-components',
  },
};
export default config;
```

## Add mocks to stories

Add `mocks` to story `parameters`:

```js
// stories/feature-a.stories.js
import { html } from 'lit';
import { http } from '@web/mocks/http.js';
import mocks from '../demo/mocks.js';

export const Default = {
  render: () => html`<feature-a></feature-a>`,
  parameters: {
    mocks: mocks.default,

    // or

    mocks: [
      mocks.default,
      http.get('/api/bar', () => Response.json({ bar: 'bar' })),
      http.post('/api/baz', () => new Response('', { status: 400 })),
    ],

    // or

    mocks: [
      http.get('/api/users/:id', ({ params }) => {
        if (params.id === '123') {
          return Response.json({ name: 'frank' });
        }
        return Response.json({ name: 'bob' });
      }),
    ],
  },
};
```
