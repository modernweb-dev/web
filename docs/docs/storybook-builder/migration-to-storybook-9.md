# Storybook Builder >> Migration from Storybook 8 to 9 ||4

## Update dependencies

`@web/storybook-builder` for Storybook 9 is released as version `0.3.x` and expects all Storybook packages to be at least `9.1.20`.

You need to:

- update `@web/storybook-builder` and `@web/storybook-framework-web-components` to `^0.3.0`
- remove outdated `@storybook/*` packages (see links below for more info)
  - most common ones to remove are `@storybook/addon-essentials`, `@storybook/addon-interactions`, `@storybook/blocks`, `@storybook/test`
  - most common one to add is `@storybook/addon-docs`
- update dependencies under the namespace `@storybook/*` and the `storybook` itself to `^9.1.20`

## General migration guide

Make sure to follow the [Storybook's own migration guide](https://storybook.js.org/docs/releases/migration-guide-from-older-version) and look into more [detailed migration notes on GitHub](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#from-version-8x-to-900).

We recommend to read all of it carefully, many small details are too easy to miss, so go through it step by step.
Some changes will be Vite/Webpack specific and unrelated to `@web/storybook-builder` or `@web/storybook-framework-web-components`, skip them.

## Specific migration notes

A few dependencies might need to be updated, only if you use them:

- update `@web/mocks` to `^2.0.0` and follow [it's migration guide](https://github.com/modernweb-dev/web/blob/master/packages/mocks/MIGRATION.md)
- update `@web/storybook-utils` to `^2.0.0`
