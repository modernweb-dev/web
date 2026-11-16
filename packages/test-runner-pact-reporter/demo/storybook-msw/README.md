# Storybook + MSW recipe

This recipe shows the ~500 lines of browser-side wiring that most adopters of
`@web/test-runner-pact-reporter` have to write themselves: listening to [MSW](https://mswjs.io/)
request/response events raised while a Storybook story runs, mapping those requests to Pact
providers and provider states, and building `PactInteraction` objects to send to this package.

The plugin/reporter themselves (`pactReporting()` / `pactPlugin()` / `pactReporter()`) are the
easy 10% of a migration to Pact contract testing from Storybook+MSW — this file is the other 90%.

## How it fits together

```
Storybook story
  → MSW intercepts fetch/XHR, returns the mocked response
  → msw-capture.js listens to MSW's 'request:match' event
  → maps request.url to a { provider, description, providerState }
  → builds a PactInteraction from the request/response
  → reportPact({ provider, interactions: [interaction] }) sends it to pactPlugin
  → pactReporter writes 'pacts/<consumer>-<provider>.json' when the run finishes
```

## 1. Configure the test runner

```js
// web-test-runner.config.js
import { defaultReporter } from '@web/test-runner';
import { pactReporting } from '@web/test-runner-pact-reporter/plugin';

const { plugin, reporter } = pactReporting({
  outputDir: 'pacts',
  consumer: { name: 'my-storybook-app' },
});

export default {
  plugins: [plugin],
  reporters: [defaultReporter(), reporter],
};
```

Using `pactReporting()` (rather than configuring `pactPlugin`/`pactReporter` separately) guarantees
both sides agree on `outputDir` — see the main [README](../../README.md#unified-configuration) for
why that matters.

## 2. Capture MSW interactions in the browser

See [`msw-capture.js`](./msw-capture.js) for the full listener. The key pieces:

- **Provider mapping**: a small table of `RegExp → provider name`, since one Storybook instance
  usually talks to several backend services (providers in Pact terms).
- **Description/provider-state labeling**: derived from the active story's name and args, so each
  interaction in the resulting Pact file is traceable back to the story that produced it.
- **Building the `PactInteraction`**: MSW's `request`/`response` objects are mapped to the shape
  `@web/test-runner-pact-reporter` expects (method, path, headers, body, status).

```js
import { reportPact } from '@web/test-runner-pact-reporter';
import { setupMswListener } from './msw-capture.js';

// Call once, e.g. from a Storybook decorator or test setup file.
setupMswListener({
  providers: [
    { match: /\/api\/orders/, provider: { name: 'orders-service' } },
    { match: /\/api\/users/, provider: { name: 'users-service' } },
  ],
  onInteraction: reportPact,
});
```

## 3. Label provider states from story args

If your stories already describe the backend state they expect (e.g. via Storybook args or a
custom `parameters.pact` block), forward that as `providerState` on each interaction — this is
what lets Pact's provider verification pick the right fixture on the provider side:

```js
export const OrderNotFound = {
  args: { orderId: 'missing' },
  parameters: {
    pact: { providerState: 'order missing does not exist' },
  },
};
```

`msw-capture.js` reads `parameters.pact.providerState` off the currently rendering story (via
Storybook's `useEffect`/context, or a global set by your decorator) and attaches it to every
interaction captured while that story is active.

## Common pitfalls

- **One story can trigger multiple interactions.** Group them by story, not globally, or
  `description` collisions will cause the built-in deduplication to collapse unrelated requests.
- **MSW mocks that don't hit the network** (e.g. pure `http.get(url, () => HttpResponse.json(...))`
  handlers with no real fetch) still fire `request:match`, so no extra instrumentation is needed —
  but static mock data may need `providerState` set explicitly since there's no backend call to infer it from.
- **Multiple providers per story.** Use the `providers` mapping's `match` regexp against the
  request URL, not the story, since a single story can call several services.
