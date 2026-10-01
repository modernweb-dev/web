import { TestRunnerPlugin } from '@web/test-runner-core';
import path from 'path';

import {
  PACT_CLEAR_COMMAND,
  PACT_REPORT_COMMAND,
  PACT_WRITE_COMMAND,
  PactFile,
} from './pactContract.js';
import { pactStore } from './pactStore.js';

export interface PactPluginArgs {
  /** Directory to write Pact files to, relative to the project root. */
  outputDir?: string;
  verbose?: boolean;
}

/**
 * Receives Pact interactions reported from the browser (via `executeServerCommand`)
 * and accumulates them in the shared `pactStore`, for `pactReporter()` to write out.
 */
export function pactPlugin({
  outputDir = 'pacts',
  verbose = process.env.PACT_REPORTER_VERBOSE === 'true',
}: PactPluginArgs = {}): TestRunnerPlugin<PactFile> {
  const fullOutputDir = path.resolve(process.cwd(), outputDir);

  return {
    name: 'pact-plugin',

    executeCommand({ command, payload }) {
      switch (command) {
        case PACT_REPORT_COMMAND: {
          const result = pactStore.report(payload);
          if (verbose) {
            console.log(`[pact-plugin] received report for provider: ${result.provider}`);
          }
          return result;
        }
        case PACT_CLEAR_COMMAND:
          pactStore.clear();
          return { success: true };
        case PACT_WRITE_COMMAND:
          return pactStore.write(fullOutputDir);
        default:
          return undefined;
      }
    },
  };
}
