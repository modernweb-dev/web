---
'@web/dev-server-esbuild': minor
---

Update ESBuild to latest version.

ESBuild has changed how TypeScript decorators are enabled in preparation for JavaScript decorators to land in browsers. ESBuild now requires the `experimentalDecorators` key to be set to `true` in the `tsconfig.json` for TypeScript decorators to be enabled.

If you are having issues with decorators after updating to this version, try setting the `experimentalDecorators` key in your `tsconfig.json`.
