---
'@web/test-runner-pact-reporter': minor
---

Add `pactReporting(options)` to configure `pactPlugin`/`pactReporter` from one shared options
object, preventing `outputDir`/`dedupStrategy` from drifting apart between them (and throwing a
clear error if they're still configured separately with mismatched options).

Add `dedupStrategy` option (`'structural'` default, or `'strict'` to disable deduplication).

Add `consumer`/`pactSpecVersion` options to set project-wide defaults, so reported payloads can
omit `consumer`/`metadata` when they match the default.

Written Pact files are now sorted by interaction `description` and always end with a trailing
newline, making them reproducible and diff-friendly across runs.

Export `PactFile`/`PactInteraction` types from the package's browser entry (not just `/plugin`),
for plain-JS + JSDoc projects.

Add a Storybook + MSW recipe under `demo/storybook-msw` showing how to capture MSW-mocked
requests as Pact interactions.
