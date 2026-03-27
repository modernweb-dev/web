# Storybook Builder >> Migration from Storybook 8 to 9 ||5

## Update dependencies

`@web/storybook-builder` for Storybook 9 is released as version `0.3.x` and expects all Storybook packages to be at least `9.1.20`.

You need to:

- update `@web/storybook-builder` and `@web/storybook-framework-web-components` to `^0.3.0`
- update dependencies under the namespace `@storybook/*` and the `storybook` itself to `^9.1.20`

## General migration guide

Make sure to follow the [Storybook's own migration guide](https://storybook.js.org/docs/releases/migration-guide-from-older-version).
We recommend to read it carefully, even though big part of it is not directly related to `@web/storybook-builder` or `@web/storybook-framework-web-components`, many small details are too easy to miss, so go through it step by step.

## Specific migration notes

Apart from Storybook's own migration steps, from the Builder API perspective the `@web/storybook-builder` is considered backwards compatible.
If you use standard Storybook addons and do not use custom WDS/rollup plugins, you shouldn't require any extra changes.

However, if you do use something custom, here is a list of some changes that might cause highly unlikely difficulties:

- Storybook 9 consolidated most packages it uses into the main storybook packages. These migrated packages and instructions are found in the [migration guide](https://storybook.js.org/docs/releases/migration-guide-from-older-version#package-structure-changes).
- CSF 3 is now the default format for stories, but CSF 2 is still supported, so if you have CSF 2 stories, they should work without any changes, but we recommend to migrate them to CSF 3 to get all the benefits of it, e.g. better support for TypeScript and better DX in general.
