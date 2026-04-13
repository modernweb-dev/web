# Migration

## From version 1.x.x to 2.x.x

### Removed Storybook addon

The Storybook addon has been moved from `@web/mocks` to `@web/storybook-addon-mocks` (currently supporting Storybook 9).
This change decouples `@web/mocks` from Storybook, allowing us to update the addon as needed for newer Storybook versions without releasing new major versions of `@web/mocks` for purely Storybook-related breaking changes.

For Storybook up to v8 keep using `@web/mocks` v1.

For Storybook v9 and later:

- upgrade `@web/mocks` to v2
- install `@web/storybook-addon-mocks`
- replace the addon to `@web/storybook-addon-mocks` (see code below)

```diff
// .storybook/main.js
/** @type {import('@web/storybook-framework-web-components').StorybookConfig} */
const config = {
  stories: ['../stories/**/*.stories.js', '../stories/**/*.mdx'],
  addons: [
-    '@web/mocks/storybook-addon',
+    '@web/storybook-addon-mocks',
  ],
};
export default config;
```

### Removed `mockRollupPlugin`

This plugin was mainly used for bundling Storybook, so it's not very useful on it's own, therefore it was deleted from `@web/mocks`.

### Update of `msw`

The version of `msw` was bumped to the latest, but is still pinned to a specific version because we've experienced a lot of unintentional breaking changes in minor or patch versions of `msw`, which leads to instability.
We recommend checking the `msw` changelog to ensure a smooth transition for your specific workflows.
