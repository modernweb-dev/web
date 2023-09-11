---
eleventyNavigation:
  key: Storybook Builder >> Overview
  title: Overview
  parent: Storybook Builder
  order: 1
---

# Web Storybook Builder

`@web/storybook-builder` is a [Storybook builder](https://storybook.js.org/docs/web-components/builders/overview) powered by [`@web/dev-server`](../dev-server/overview.md).
If you are using the ecosystem of `@web/dev-server` and `@web/test-runner`, then this is the right choice for your Storybook setup.

## Installation

Install the `@web/storybook-builder`:

```bash
npm install @web/storybook-builder --save-dev
```

Install a framework, e.g. for Web Components:

> Information about supported frameworks can be found [here](./frameworks.md).

```bash
npm install @web/storybook-framework-web-components --save-dev
```

Then proceed to the [Configuration](./configuration.md).

## Migration

If you are migrating from the `@web/dev-server-storybook` plugin to Storybook 7, please read the [Migration to Storybook 7 guide](./migration-to-storybook-7.md).
