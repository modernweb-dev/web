---
'@web/storybook-builder': patch
---

Load `slash` and `@mdx-js/mdx` with a native dynamic `import()`, so the builder works on Node versions without `require(esm)` support.
