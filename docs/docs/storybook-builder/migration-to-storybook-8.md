# Storybook Builder >> Migration from Storybook 7 to 8 ||4

## Update dependencies

`@web/storybook-builder` for Storybook 8 is released as version `0.2.x` and expects all Storybook packages to be at least `8.5.0`.

You need to:

- update `@web/storybook-builder` and `@web/storybook-framework-web-components` to `^0.2.0`
- update dependencies under the namespace `@storybook/*` and the `storybook` itself to `^8.5.0`

## General migration guide

Make sure to follow the [Storybook's own migration guide](https://storybook.js.org/docs/migration-guide).
We recommend to read it carefully, even though big part of it is not directly related to `@web/storybook-builder` or `@web/storybook-framework-web-components`, many small details are too easy to miss, so go through it step by step.

## Specific migration notes

Apart from Storybook's own migration steps, from the Builder API perspective the `@web/storybook-builder` is considered backwards compatible.
If you use standard Storybook addons and do not use custom WDS/rollup plugins, you shouldn't require any extra changes.

However, if you do use something custom, here is a list of some changes that might cause highly unlikely difficulties:

- the Storybook dependencies graph was optimized, some packages are now consolidated and 3rd-party dependencies are bundled into Storybook packages, which brings a lot of improvements, e.g. simplifies managing and updating the Storybook 8 between minor versions and decreases the runtime bundling required on the builder side, but this also means that some dependencies might behave differently since they are now bundled by Storybook itself, on top of it we came across the code that's not browser compatible (e.g. the usage of `process`) and now needs to be transpiled on-the-fly
- MDX was upgraded from 2 to 3 following the Storybook's requirement, the integration of it in the builder needed to be updated too due to a changes in the Storybook packages and some removed APIs
