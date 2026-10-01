import { executeServerCommand } from '@web/test-runner-commands';

const PLUGIN_NAME = 'pactPlugin from @web/test-runner-pact-reporter';

/**
 * Reports a captured Pact file to the Node-side `pactPlugin`/`pactReporter`.
 */
export function reportPact(pactFile) {
  return executeServerCommand('pact:report', pactFile, PLUGIN_NAME);
}

/**
 * Clears any Pact interactions accumulated so far, for test isolation.
 */
export function clearPacts() {
  return executeServerCommand('pact:clear', undefined, PLUGIN_NAME);
}

/**
 * Flushes all accumulated Pact files to disk immediately, instead of waiting for `onTestRunFinished`.
 */
export function writePacts() {
  return executeServerCommand('pact:write', undefined, PLUGIN_NAME);
}

/**
 * Creates a writer compatible with `@pactflow/pact-msw-adapter`'s `writeToFile(writer)`,
 * forwarding each captured Pact file to the Node-side plugin instead of writing to disk directly
 * (which isn't possible from a browser environment).
 */
export function createPactWriter() {
  return async (_filePath, data) => {
    const pactFile = typeof data === 'string' ? JSON.parse(data) : data;
    await reportPact(pactFile);
  };
}
