import { PactFile } from '../dist/index.js';

/**
 * Reports a captured Pact file to the Node-side `pactPlugin`/`pactReporter`.
 */
export function reportPact(pactFile: PactFile): Promise<void>;

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
export function createPactWriter(): (filePath: string, data: string | PactFile) => Promise<void>;
