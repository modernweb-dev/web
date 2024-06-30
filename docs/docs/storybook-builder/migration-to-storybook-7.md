# Storybook Builder >> Migration to Storybook 7 ||4

This guide explains how to migrate from [`@web/dev-server-storybook` plugin](../dev-server/plugins/storybook.md) (that used opinionated Storybook 6 bundle `@web/storybook-prebuilt`) to Storybook 7 and new `@web/storybook-builder`.

Most of the [official migration guide for Storybook 7](https://storybook.js.org/docs/web-components/migration-guide) applies to this migration too, with a few additions and exceptions.
Please check the official guide, but before running the `upgrade` command read the sections below.

## Prepare to run upgrade CLI

The Storybook CLI `upgrade` command is not aware of the `@web/dev-server-storybook` plugin and as a result it won't work by default.
But with a simple workaround you can make it work.

First, install the old version of `builder-vite` and old Storybook 6 renderer for the technology you used in the old setup, e.g. for Web Components it will be:

```bash
npm install @storybook/builder-vite@0.4 @storybook/web-components@6 --save-dev
```

Then proceed with the `upgrade` script and follow it's interactive process:

```bash
npx storybook@7 upgrade
```

Then [configure the builder and framework](./configuration.md#configuring-builder-and-framework) in the main Storybook configuration.

## Uninstall old packages

```bash
npm uninstall @web/dev-server-storybook @web/storybook-prebuilt --save-dev
```

## Install addons

The old Storybook 6 bundle `@web/storybook-prebuilt` came with a few preconfigured addons.
In the new setup you'll need to install and configure them explicitly.

We recommend to install the following addons:

```bash
npm install @storybook/addon-essentials@7 @storybook/addon-links@7 --save-dev
```

Then register them in the Storybook main configuration file:

```js
// .storybook/main.js

/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
  ...
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    ...
  ],
  ...
};

export default config;
```

## Rename rollupConfig to rollupFinal

For consistency with other similar hooks in the Storybook ecosystem, including `@web/storybook-builder`'s `wdsFinal`, the rollup hook was renamed to `rollupFinal`.

If you use `rollupConfig`, rename it to `rollupFinal`.

## Change CLI commands

`@web/dev-server-storybook` was a plugin of `@web/dev-server`, therefore you used to run Storybook via [`@web/dev-server` CLI](../dev-server/cli-and-configuration.md).

With the introduction of [builders](https://storybook.js.org/docs/web-components/builders/overview) in Storybook 7 this is no longer the case and you can make use of [Storybook CLI](https://storybook.js.org/docs/web-components/api/cli-options).

Typically you'll use `storybook dev` and `storybook build` to start the dev server and create a static build for deployment.

So you need to update your NPM scripts accordingly:

```js
// package.json
{
  "scripts": {
    "storybook:start": "storybook dev -p 6006",
    "storybook:build": "storybook build --output-dir demo-storybook",
  },
}
```

## Usage of ESM

Storybook 7 supports ES modules for configuration files, so we recommend using standard ESM syntax for imports and exports in `.storybook/main.js` and other configuration files.

## Storybook specific configuration

The usage of `web-dev-server.config.{mjs,cjs,js}` file for Storybook specific configuration is not recommended.
You should use this file for your project dev server.

If you have a Storybook specific configuration, move it to the [wdsFinal hook](./configuration.md#option-wdsfinal) instead.

### Option "port"

The `port` configured in `web-dev-server.config.{mjs,cjs,js}` won't have any effect on the Storybook, because Storybook CLI runs it's own dev server.

To open Storybook dev server on a certain port use the Storybook CLI argument instead:

```bash
storybook dev -p XXXX
```

### Option "open"

The `open` URL configured in `web-dev-server.config.{mjs,cjs,js}` won't have any effect on the Storybook, because it conflicts with the Storybook auto-open behavior.

To open a non-default URL do the following:

- disable open in Storybook CLI, e.g. `storybook dev -p XXXX --no-open`
- configure `open` in [wdsFinal hook](./configuration.md#option-wdsfinal)
