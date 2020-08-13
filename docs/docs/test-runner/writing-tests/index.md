---
title: Writing tests
layout: with-index.njk
eleventyNavigation:
  key: Writing tests
  parent: Test Runner
  order: 3
---

Web test runners reads the configured test files, and runs them inside each of the configured browsers. Each test file runs in it's own browser environment, there is no shared state between tests. This enables concurrency and keeps tests isolated.
