# Dev Server >> Plugins >> Storybook ||7

> This project is currently in alpha. Expect updates and breaking changes.

Plugin for using Storybook with Web Dev Server using es modules.

## How it works

This plugin uses an [opinionated build](https://github.com/modernweb-dev/storybook-prebuilt) of Storybook, making it possible to use it with native es modules and buildless workflows.

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

We currently supported `preact` and `web-components` project types. This corresponds to the Storybook "Framework".

Other project types could be supported, let us know if you are interested in this.

### preview.js

We read a `.storybook/preview.js` file like regular storybook.

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
