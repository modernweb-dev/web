/** Command names making up the Pact wire contract between browser adapter and Node plugin. */
export const PACT_REPORT_COMMAND = 'pact:report';
export const PACT_CLEAR_COMMAND = 'pact:clear';
export const PACT_WRITE_COMMAND = 'pact:write';

export interface PactInteraction {
  description?: string;
  providerState?: string;
  request: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    query?: string;
    body?: unknown;
    matchingRules?: Record<string, unknown>;
  };
  response: {
    status: number;
    headers?: Record<string, string>;
    body?: unknown;
    matchingRules?: Record<string, unknown>;
  };
}

export interface PactFile {
  consumer: { name: string };
  provider: { name: string };
  interactions: PactInteraction[];
  metadata: {
    pactSpecification: { version: string };
    client?: { name: string; version: string };
  };
}

/**
 * Payload accepted from the browser via `reportPact()`. `consumer` and `metadata` are optional
 * here because `pactPlugin`/`pactReporter` can fill them in from project-wide defaults
 * (see `PactDefaults`), so most callers only need to send `{ provider, interactions }`.
 */
export interface PactReportPayload {
  consumer?: { name: string };
  provider: { name: string };
  interactions: PactInteraction[];
  metadata?: {
    pactSpecification?: { version: string };
    client?: { name: string; version: string };
  };
}

/** Project-wide defaults, configured once on the plugin/reporter, to fill in payloads that omit them. */
export interface PactDefaults {
  consumer?: { name: string };
  pactSpecVersion?: string;
}

/**
 * Strategy used to collapse interactions that only differ in test data:
 * - `'structural'` (default): collapse interactions with the same method, path, status and
 *   request/response shape, keeping the first one seen.
 * - `'strict'`: keep every interaction as reported, without deduplication.
 */
export type PactDedupStrategy = 'structural' | 'strict';

export interface PactReportResult {
  success: boolean;
  provider?: string;
  interactionCount?: number;
  error?: string;
}

export interface PactWriteResult {
  success: boolean;
  files: { provider: string; filename: string; interactionCount: number }[];
}

/** Structural signature of a value (sorted key paths, values ignored), used to collapse same-shape interactions. */
function getStructuralShape(value: unknown, jsonPath = '$'): string[] {
  if (Array.isArray(value)) {
    return value.length > 0 ? getStructuralShape(value[0], `${jsonPath}[]`) : [`${jsonPath}[]`];
  }
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .flatMap(key =>
        getStructuralShape((value as Record<string, unknown>)[key], `${jsonPath}.${key}`),
      );
  }
  return [jsonPath];
}

/**
 * Collapses interactions that only differ in test data (not in method/path/status/schema) to one
 * representative. Pass `strategy: 'strict'` to disable deduplication and keep every interaction.
 */
export function deduplicateInteractions(
  interactions: PactInteraction[],
  strategy: PactDedupStrategy = 'structural',
): PactInteraction[] {
  if (strategy === 'strict') {
    return interactions;
  }

  const seen = new Map<string, PactInteraction>();

  for (const interaction of interactions) {
    const method = interaction.request?.method ?? '';
    const requestPath = interaction.request?.path ?? '';
    const status = interaction.response?.status ?? '';
    const requestShape = getStructuralShape(interaction.request?.body).join(',');
    const responseShape = getStructuralShape(interaction.response?.body).join(',');
    const key = `${method}:${requestPath}:${status}:${requestShape}:${responseShape}`;

    if (!seen.has(key)) {
      seen.set(key, interaction);
    }
  }

  return Array.from(seen.values());
}
