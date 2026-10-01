import { Reporter } from '@web/test-runner-core';
import path from 'path';

import { pactStore } from './pactStore.js';

export interface PactReporterArgs {
  /** Directory to write Pact files to, relative to the project root. Must match `pactPlugin`'s `outputDir`. */
  outputDir?: string;
  verbose?: boolean;
}

/**
 * Writes the Pact files accumulated by `pactPlugin` to disk once a test run finishes,
 * deduplicating interactions that only differ in test data.
 */
export function pactReporter({
  outputDir = 'pacts',
  verbose = process.env.PACT_REPORTER_VERBOSE === 'true',
}: PactReporterArgs = {}): Reporter {
  const fullOutputDir = path.resolve(process.cwd(), outputDir);

  return {
    onTestRunStarted() {
      pactStore.clear();
    },

    onTestRunFinished() {
      if (pactStore.size === 0) {
        return;
      }

      const { files } = pactStore.write(fullOutputDir);
      if (verbose) {
        for (const file of files) {
          console.log(
            `[pact-reporter] wrote ${file.filename} (${file.interactionCount} interactions)`,
          );
        }
      }
    },

    getTestProgress() {
      return [`Pact providers: ${pactStore.size}, interactions: ${pactStore.interactionCount}`];
    },
  };
}
