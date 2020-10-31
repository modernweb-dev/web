# Dev Server >> Plugins >> Storybook ||7

> This project is currently in alpha. Expect updates and breaking changes.

Plugin for using Storybook with Web Dev Server using es modules.

## How it works

This plugin uses an [opinionated build](https://github.com/modernweb-dev/storybook-prebuilt) of Storybook, making it possible to use it with native es modules.

This build installs a default set of addons:

- Actions
- Backgrounds
- Controls
- Docs
- Viewport
- Toolbars

It's not possible to install other addons at the moment.

## Usage

Install the package:

```
npm i --save-dev @web/dev-server-storybook
```

Add the plugin and set the project type. See below for supported project types.

```js
import { storybookPlugin } from '@web/dev-server-storybook';

export default {
  plugins: [storybookPlugin({ type: 'webcomponents' })],
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

export const ButtonA = args => Button(args);
ButtonA.args = {
  text: 'Button A',
};

export const ButtonB = args => Button(args);
ButtonB.args = {
  text: 'Button B',
};
```

## Configuration

### Project types

We currently supported `preact` and `webcomponents` project types. This corresponds to the Storybook "Framework".

Other project types could be supported, let us know if you are interested in this.

### preview.js

We read a `.storybook/preview.js` file like regular storybook.

### Customizing storybook directory

You can customize the storybook directory when instantiating the plugin:

```js
import { storybookPlugin } from '@web/dev-server-storybook';

export default {
  plugins: [storybookPlugin({ type: 'webcomponents', configDir: 'custom-directory' })],
};
```

## Production build

Building the storybook for production is currently not supported. We plan to add this later.
