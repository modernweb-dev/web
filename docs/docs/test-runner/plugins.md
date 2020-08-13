---
title: Plugins
eleventyNavigation:
  key: Server Plugins
  parent: Test Runner
  order: 7
---

The test runner uses `@web/dev-server` to your test files to the browser. The dev server has many configuration options, a plugin system to do code transformations, and middleware to change the server's behavior.

We recommend reading these pages:

- [Plugins](../dev-server/plugins/index.md) for a general overview
- [esbuild](../dev-server/plugins/esbuild.md) for TS, JSX and TSX
- [rollup](../dev-server/plugins/esbuild.md) for using rollup plugins
- [Writing plugins](../dev-server/plugins/writing-plugins.md)
