import { PactFile, PactInteraction, PactReportPayload } from '../dist/index.js';

// Re-exported here so consumers of the browser entrypoint (e.g. plain-JS + JSDoc projects) can
// type-check Pact payloads without importing from the Node-only `/plugin` subpath.
export { PactFile, PactInteraction };

/**
 * Reports a captured Pact file to the Node-side `pactPlugin`/`pactReporter`. `consumer` and
 * `metadata` may be omitted if a default was configured on `pactPlugin`/`pactReporter`.
 */
export function reportPact(pactFile: PactReportPayload): Promise<void>;

/**
 * Clears any Pact interactions accumulated so far, for test isolation.
 */
export function clearPacts(): Promise<void>;

/**
 * Flushes all accumulated Pact files to disk immediately, instead of waiting for `onTestRunFinished`.
 */
export function writePacts(): Promise<void>;

/**
 * Creates a writer compatible with `@pactflow/pact-msw-adapter`'s `writeToFile(writer)`,
 * forwarding each captured Pact file to the Node-side plugin instead of writing to disk directly
 * (which isn't possible from a browser environment).
 */
export function createPactWriter(): (
  filePath: string,
  data: string | PactReportPayload,
) => Promise<void>;
