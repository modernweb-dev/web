# Storybook Builder >> Migration from Storybook 8 to 9

## General migration guide

Storybook 9 introduced changes which consolidated external packages into the main Storybook packages. To avoid compatibility issues, `@web/mocks` won't be migrated and will keep support for Storybook 8, instead, we recommend using `@web/storybook-addons-mocks` which is compatible with Storybook 9.
This is a drop-in replacement, so you can just change the import from `@web/mocks` to `@web/storybook-addons-mocks` and it should work without any issues while on version 9.
