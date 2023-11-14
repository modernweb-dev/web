# Storybook Builder >> Configuration ||2

`@web/storybook-builder` aims at compatibility with standard Storybook features, e.g. configuration of preview (`.storybook/preview.js`), official addons, etc.
You can follow the [official Storybook docs](https://storybook.js.org/) for the general setup and configuration options.

> This documentation is written with Web Components and `@web/storybook-framework-web-components` in mind.
> Information about supported frameworks can be found [here](./frameworks.md).

You can use the `storybook init` CLI command with interactive setup.
Choose Web Components and any builder when asked by the CLI.

When you finish the setup you'll have a standard Storybook folder with configuration files (`.storybook` by default) containing at least `main.js`.

## Configuring builder and framework

Set the `type` and `framework` in `main.js`:

- set the `config` type to `import('@web/storybook-framework-web-components').StorybookConfig`
- set the `framework.name` to `'@web/storybook-framework-web-components'`

```js
// .storybook/main.js

/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
  ...
  framework: {
    name: '@web/storybook-framework-web-components',
  },
  ...
};

export default config;
```

## Configuring dev server

The builder implements a backend for the `storybook dev` CLI command and comes with a default `@web/dev-server` configuration which adheres to browser standards and supports official addons of the Storybook ecosystem.

### `@web/dev-server` configuration file

When Storybook is loaded, the builder's default `@web/dev-server` config gets automatically merged with the project's [configuration file (`web-dev-server.config.{mjs,cjs,js}`)](../dev-server/cli-and-configuration.md#configuration-file) if present.
This is needed to ensure that the same configuration is used for application, feature or design system you are building.

### Option `framework.options.builder.wdsConfigPath`

You can configure a different path to the configuration file using `framework.options.builder.wdsConfigPath`, relative to CWD:

```js
// .storybook/main.js

/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
  ...
  framework: {
    name: '@web/storybook-framework-web-components',
    options: {
      builder: {
        wdsConfigPath: 'storybook-wds.config.mjs',
      },
    },
  },
  ...
};

export default config;
```

### Option `wdsFinal`

Sometimes you might need to add Storybook specific configuration for the dev server, you can use the `wdsFinal` option for this:

```js
// .storybook/main.js

/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
  ...
  framework: {
    name: '@web/storybook-framework-web-components',
  },
  async wdsFinal(config) {
    // add Storybook specific configuration for `@web/dev-server`
    // e.g. "open" to go to a custom URL in the browser when server has started
    config.open = '/custom-path';
    return config;
  },
  ...
};

export default config;
```

The `config` parameter is a `@web/dev-server` config, you can use this to customize your `@web/dev-server` options and plugins.

> When using rollup plugins make sure to [convert them to `@web/dev-server` ones](../dev-server/plugins/rollup.md).

## Configuring static build

The builder implements a backend for the `storybook build` CLI command and comes with a default `rollup` configuration which adheres to browser standards and supports official addons of the Storybook ecosystem.

### Option `rollupFinal`

Sometimes you might need to add some extra configuration for the static build, you can use the `rollupFinal` option for this:

```js
// .storybook/main.js
import polyfillsLoader from '@web/rollup-plugin-polyfills-loader';

/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
  ...
  framework: {
    name: '@web/storybook-framework-web-components',
  },
  async rollupFinal(config) {
    // add extra configuration for rollup
    // e.g. a new plugin
    config.plugins.push(polyfillsLoader({
      polyfills: {
        esModuleShims: true,
      },
    }));
    return config;
  },
  ...
};

export default config;
```

The `config` parameter is a `rollup` config, you can use this to customize your `rollup` options and plugins.
