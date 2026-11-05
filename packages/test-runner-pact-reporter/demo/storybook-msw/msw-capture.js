// Reference recipe for capturing MSW-mocked requests as Pact interactions, for projects using
// Storybook + MSW. See ./README.md for the full explanation of how this fits together.

/**
 * @typedef {object} ProviderMapping
 * @property {RegExp} match - Matched against the request URL's pathname.
 * @property {{ name: string }} provider - Pact provider this request belongs to.
 */

/**
 * Finds the first provider mapping whose `match` regexp matches `pathname`.
 * @param {ProviderMapping[]} providers
 * @param {string} pathname
 */
function resolveProvider(providers, pathname) {
  const mapping = providers.find(({ match }) => match.test(pathname));
  return mapping?.provider;
}

/**
 * Reads the active story's provider-state label, if any, from a story's parameters. Expects a
 * convention of `parameters.pact.providerState` on the story (see README.md, step 3).
 * @param {unknown} storyContext
 */
function getProviderState(storyContext) {
  return storyContext?.parameters?.pact?.providerState;
}

/**
 * Builds a `PactInteraction` from an MSW request/response pair plus the active story's context.
 * @param {{ request: Request; response: Response; requestBody: unknown; responseBody: unknown }} capture
 * @param {unknown} storyContext
 */
async function toInteraction({ request, response, requestBody, responseBody }, storyContext) {
  const url = new URL(request.url);

  return {
    description: `${storyContext?.title ?? 'story'} - ${storyContext?.name ?? 'unknown'}`,
    providerState: getProviderState(storyContext),
    request: {
      method: request.method,
      path: url.pathname,
      query: url.search ? url.search.slice(1) : undefined,
      headers: Object.fromEntries(request.headers.entries()),
      body: requestBody,
    },
    response: {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
    },
  };
}

/**
 * Wires up an MSW `request:match` listener that maps intercepted requests to Pact providers and
 * forwards built interactions to `onInteraction` (typically `reportPact` from
 * `@web/test-runner-pact-reporter`).
 *
 * Call once per test/story run, e.g. from a Storybook decorator or a global test setup file.
 *
 * @param {object} options
 * @param {ProviderMapping[]} options.providers
 * @param {(payload: { provider: { name: string }; interactions: unknown[] }) => Promise<unknown>} options.onInteraction
 * @param {() => unknown} [options.getStoryContext] - Returns the currently rendering story's context.
 */
export function setupMswListener({ providers, onInteraction, getStoryContext = () => undefined }) {
  // `worker` here refers to the project's existing MSW `setupWorker()` instance; it's expected
  // to already be running (e.g. via `initialize()` from `msw-storybook-addon`).
  const worker = globalThis.__mswWorker;
  if (!worker) {
    throw new Error(
      'setupMswListener() expects an MSW worker to be available at globalThis.__mswWorker ' +
        '(set this up alongside msw-storybook-addon in your Storybook preview config).',
    );
  }

  worker.events.on('request:match', async ({ request, response, requestId }) => {
    const url = new URL(request.url);
    const provider = resolveProvider(providers, url.pathname);
    if (!provider) {
      // Not a request we track as a Pact interaction (e.g. analytics, unrelated 3rd-party calls).
      return;
    }

    const requestBody = await safeReadJson(request.clone());
    const responseBody = await safeReadJson(response.clone());
    const storyContext = getStoryContext();

    const interaction = await toInteraction(
      { request, response, requestBody, responseBody },
      storyContext,
    );

    await onInteraction({ provider, interactions: [interaction] });
  });
}

/** Reads a Request/Response body as JSON, tolerating non-JSON or empty bodies. */
async function safeReadJson(requestOrResponse) {
  try {
    const text = await requestOrResponse.text();
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
}
