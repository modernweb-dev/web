---
'@web/demo-lit-element': minor
'@web/demo-lit-element-ts': minor
'@web/demo-preact-htm': minor
'@web/demo-preact-jsx': minor
'@web/demo-preact-tsx': minor
'@web/dev-server-core': minor
'@web/dev-server-esbuild': minor
'@web/dev-server-rollup': minor
'@web/test-runner': minor
'@web/test-runner-chrome': minor
'@web/test-runner-cli': minor
'@web/test-runner-core': minor
'@web/test-runner-playwright': minor
'@web/test-runner-puppeteer': minor
'@web/test-runner-selenium': minor
'@web/test-runner-server': minor
---

Use web dev server in test runner. This contains multiple breaking changes:

- Browsers that don't support es modules are not supported for now. We will add this back later.
- Most es-dev-server config options are no longer available. The only options that are kept are `plugins`, `middleware`, `nodeResolve` and `preserveSymlinks`.
- Test runner config changes:
  - Dev server options are not available on the root level of the configuration file.
  - `nodeResolve` is no longer enabled by default. You can enable it with the `--node-resolve` flag or `nodeResolve` option.
  - `middlewares` option is now called `middleware`.
  - `testFrameworkImport` is now called `testFramework`.
  - `address` is now split into `protocol` and `hostname`.
