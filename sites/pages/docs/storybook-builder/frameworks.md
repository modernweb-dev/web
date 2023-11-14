# Storybook Builder >> Frameworks ||3

Storybook supports different technologies via [frameworks](https://storybook.js.org/docs/web-components/api/new-frameworks).
Frameworks simplify the configuration of the Storybook for a specific builder like `@web/storybook-builder`.

Currently we support only Web Components.

## @web/storybook-framework-web-components

Storybook framework for `@web/storybook-builder` + Web Components

### Installation

Install the framework:

```bash
npm install @web/storybook-framework-web-components --save-dev
```

### Configuration

Configure the type and framework name in the Storybook main configuration file:

```js
// .storybook/main.js

/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
  ...
  framework: {
    name: '@web/storybook-framework-web-components',
    ...
  },
  ...
};
```
