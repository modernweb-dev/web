# Migration

## From version 2.x.x to 3.x.x

Remove `bundleAssetsFromCss` configuration option, now we bundle assets referenced in CSS by default.

Check all output assets since now we handle all link `rel` types, specifically:

- icon
- apple-touch-icon
- mask-icon
- stylesheet
- manifest
- preload
- prefetch
- modulepreload

If any of them reference external assets or assets that don't need to be bundled, you can exclude such assets using the `externalAssets` configuration option.

For old behavior which is only recommeneded during the migration you can check legacy modes `extractAssets: 'legacy-html'` and `extractAssets: 'legacy-html-and-css'` in the documentation.
