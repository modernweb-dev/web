# Test Runner Pact Reporter

Pact contract file plugin and reporter for `@web/test-runner`.

Captures API interactions recorded in the browser (for example by a Pact/MSW adapter) and
writes them to disk as [Pact](https://docs.pact.io/) contract files once a test run finishes.

## Usage

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

## Options

### `pactPlugin(options)`

| Option      | Type      | Default   | Description                              |
| ----------- | --------- | --------- | ---------------------------------------- |
| `outputDir` | `string`  | `'pacts'` | Directory to write Pact files to.        |
| `verbose`   | `boolean` | `false`   | Log each received report to the console. |

### `pactReporter(options)`

| Option      | Type      | Default   | Description                                                |
| ----------- | --------- | --------- | ---------------------------------------------------------- |
| `outputDir` | `string`  | `'pacts'` | Directory to write Pact files to. Must match `pactPlugin`. |
| `verbose`   | `boolean` | `false`   | Log each written file to the console.                      |

## Wire contract

The browser-side helpers and the Node-side `pactPlugin` communicate over the test runner's
existing `executeServerCommand` / `executeCommand` RPC channel using the following commands:

| Command       | Payload               | Response                                                                       |
| ------------- | --------------------- | ------------------------------------------------------------------------------ |
| `pact:report` | one `PactFile` object | `{ success: true, provider, interactionCount }` or `{ success: false, error }` |
| `pact:clear`  | _(none)_              | `{ success: true }`                                                            |
| `pact:write`  | _(none)_              | `{ success: true, files: [{ provider, filename, interactionCount }] }`         |

A `PactFile` has the shape:

```ts
interface PactFile {
  consumer: { name: string };
  provider: { name: string };
  interactions: PactInteraction[];
  metadata: {
    pactSpecification: { version: string };
    client?: { name: string; version: string };
  };
}
```

The adapter sending reports may stream raw interactions, including duplicates across
multiple `pact:report` calls for the same provider — `pactPlugin`/`pactReporter` merge
interactions per provider and deduplicate by request method, path, status and request/response
structural shape before writing each provider's Pact file to disk.
