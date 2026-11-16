# Test Runner Pact Reporter

Pact contract file plugin and reporter for `@web/test-runner`.

Captures API interactions recorded in the browser (for example by a Pact/MSW adapter) and
writes them to disk as [Pact](https://docs.pact.io/) contract files once a test run finishes.

## Usage

The recommended way to configure this package is `pactReporting()`, which configures a matching
`pactPlugin`/`pactReporter` pair from one shared options object — this guarantees they can't drift
apart (see [Unified configuration](#unified-configuration) below):

```js
import { pactReporting } from '@web/test-runner-pact-reporter/plugin';
import { defaultReporter } from '@web/test-runner';

const { plugin, reporter } = pactReporting({
  outputDir: 'pacts',
  consumer: { name: 'my-consumer' },
});

export default {
  plugins: [plugin],
  reporters: [defaultReporter(), reporter],
};
```

`pactPlugin(options)` and `pactReporter(options)` are also exported individually, for cases where
the plugin and reporter genuinely need different options:

```js
import { pactPlugin, pactReporter } from '@web/test-runner-pact-reporter/plugin';
import { defaultReporter } from '@web/test-runner';

export default {
  plugins: [pactPlugin({ outputDir: 'pacts' })],
  reporters: [defaultReporter(), pactReporter({ outputDir: 'pacts' })],
};
```

In the browser, report captured interactions using the exported helpers:

```js
import { reportPact } from '@web/test-runner-pact-reporter';

await reportPact({
  provider: { name: 'my-provider' },
  interactions: [/* ... */],
});
```

`consumer` and `metadata.pactSpecification.version` can be omitted from the payload if you
configured defaults for them (see [Project-wide defaults](#project-wide-defaults)); otherwise
include them explicitly:

```js
await reportPact({
  consumer: { name: 'my-consumer' },
  provider: { name: 'my-provider' },
  interactions: [/* ... */],
  metadata: { pactSpecification: { version: '3.0.0' } },
});
```

`createPactWriter()` returns a writer compatible with `@pactflow/pact-msw-adapter`'s
`writeToFile(writer)`, for streaming interactions captured by that adapter straight to this
package instead of writing to disk directly (which a browser environment can't do):

```js
import { createPactWriter } from '@web/test-runner-pact-reporter';

await pactAdapter.writeToFile(createPactWriter());
```

For a complete recipe of capturing MSW-mocked requests from Storybook stories — the part of a
migration that takes the most code — see [demo/storybook-msw](./demo/storybook-msw).

## Options

### `pactReporting(options)`

Returns `{ plugin, reporter }`, both configured from the same `options`. Accepts every option
listed below for `pactPlugin`/`pactReporter`.

### `pactPlugin(options)`

| Option            | Type                       | Default        | Description                                                                                      |
| ----------------- | -------------------------- | -------------- | ------------------------------------------------------------------------------------------------ |
| `outputDir`       | `string`                   | `'pacts'`      | Directory to write Pact files to.                                                                |
| `verbose`         | `boolean`                  | `false`        | Log each received report to the console.                                                         |
| `dedupStrategy`   | `'structural' \| 'strict'` | `'structural'` | How to collapse interactions that only differ in test data. See [Deduplication](#deduplication). |
| `consumer`        | `{ name: string }`         | _(none)_       | Default consumer name for reports that omit `consumer`.                                          |
| `pactSpecVersion` | `string`                   | `'3.0.0'`      | Default Pact spec version for reports that omit `metadata`.                                      |

### `pactReporter(options)`

Same options as `pactPlugin`, and **must be configured identically** — `pactPlugin` and
`pactReporter` validate this at startup and throw if `outputDir` or `dedupStrategy` differ between
them. Use `pactReporting()` to avoid having to keep them in sync by hand.

## Unified configuration

`pactPlugin` and `pactReporter` each run independently (one receives reports from the browser, the
other writes them to disk once a run finishes), but they must agree on `outputDir` and
`dedupStrategy` — if the directories differ, interactions are written to two different places and
the mismatch is easy to miss. Rather than relying on you to keep two option objects in sync, both
functions register their resolved configuration with a shared internal store, which throws
immediately if a conflicting configuration is registered:

```
Error: [@web/test-runner-pact-reporter] Configuration mismatch: pactPlugin is configured with
outputDir "/project/pacts", but pactReporter is configured with outputDir "/project/other-pacts".
pactPlugin and pactReporter must agree on this option. Consider using pactReporting(options) to
share one options object between both.
```

Prefer `pactReporting(options)`, which passes the same options object to both and makes this
class of mistake structurally impossible. Because a pair built by `pactReporting()` is coherent by
construction, calling it more than once in the same process (for example across several config
files) replaces the previous configuration rather than reporting a mismatch. Note that captured
interactions are held in one process-wide store, so a single test run should use a single Pact
configuration.

## Project-wide defaults

Most projects have one `consumer` name and one Pact spec version for the whole test suite.
Configuring these as defaults means the browser-side payload only needs `{ provider, interactions }`,
instead of repeating `consumer`/`metadata` in every call site:

```js
pactReporting({ consumer: { name: 'my-consumer' }, pactSpecVersion: '3.0.0' });
```

A payload that sets its own `consumer`/`metadata` always takes priority over the configured
defaults.

## Deduplication

By default (`dedupStrategy: 'structural'`), interactions that share the same request method, path,
response status and request/response shape (sorted key paths, ignoring values) are collapsed to a
single representative interaction — this avoids a Pact file growing a new entry for every test run
that just varies fixture data. Set `dedupStrategy: 'strict'` to disable this and keep every
reported interaction as-is.

## Reproducible output

Generated Pact files are sorted by interaction `description` and always end with a trailing
newline, so re-running the same tests against unchanged code produces byte-identical output. This
keeps generated `.json` files diff-friendly in code review and avoids noisy, non-deterministic
diffs in CI caused only by interaction ordering.

## Wire contract

The browser-side helpers and the Node-side `pactPlugin` communicate over the test runner's
existing `executeServerCommand` / `executeCommand` RPC channel using the following commands:

| Command       | Payload                        | Response                                                                       |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `pact:report` | one `PactReportPayload` object | `{ success: true, provider, interactionCount }` or `{ success: false, error }` |
| `pact:clear`  | _(none)_                       | `{ success: true }`                                                            |
| `pact:write`  | _(none)_                       | `{ success: true, files: [{ provider, filename, interactionCount }] }`         |

A `PactReportPayload` has the shape:

```ts
interface PactReportPayload {
  consumer?: { name: string }; // optional if a default `consumer` is configured
  provider: { name: string };
  interactions: PactInteraction[];
  metadata?: {
    pactSpecification?: { version: string }; // optional if a default `pactSpecVersion` is configured
    client?: { name: string; version: string };
  };
}
```

`PactFile`/`PactInteraction` types are exported both from the package's main (browser) entry and
from `/plugin`, so plain-JS + JSDoc projects can type-check payloads without importing from the
Node-only `/plugin` subpath:

```js
/** @typedef {import('@web/test-runner-pact-reporter').PactInteraction} PactInteraction */
```

The adapter sending reports may stream raw interactions, including duplicates across
multiple `pact:report` calls for the same provider — `pactPlugin`/`pactReporter` merge
interactions per provider before writing each provider's Pact file to disk (see
[Deduplication](#deduplication) for how duplicates are collapsed).

## Design notes

A couple of things that look like gaps but are deliberate:

- **`@web/test-runner-commands` and `@web/test-runner-core` are regular `dependencies`, not
  `peerDependencies`.** Every other `@web/test-runner-*` plugin/reporter package in this monorepo
  (`test-runner-chrome`, `test-runner-playwright`, `test-runner-junit-reporter`, etc.) depends on
  these the same way, and the monorepo's release tooling (changesets with
  `updateInternalDependencies: patch`) assumes internal `@web/*` packages stay in version lockstep.
  Making this one package's dependencies `peer` would be inconsistent with every sibling package
  and wouldn't fix anything a lockstep release doesn't already guarantee.
- **`engines.node` is `>=22.0.0`.** This matches the Node version floor for the whole monorepo
  (all `@web/*` packages dropped Node 18/20 support), not a decision specific to this package.
