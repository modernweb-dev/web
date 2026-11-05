import { Reporter } from '@web/test-runner-core';
import path from 'path';

import { PactDedupStrategy } from './pactContract.js';
import { pactStore } from './pactStore.js';

export interface PactReporterArgs {
  /** Directory to write Pact files to, relative to the project root. Must match `pactPlugin`'s `outputDir`. */
  outputDir?: string;
  verbose?: boolean;
  /**
   * Strategy for collapsing interactions that only differ in test data. Defaults to
   * `'structural'`; pass `'strict'` to keep every interaction as reported. Must match `pactPlugin`.
   */
  dedupStrategy?: PactDedupStrategy;
  /** Default consumer name, used for any reported payload that doesn't set its own `consumer`. */
  consumer?: { name: string };
  /** Default Pact specification version, used for any payload that doesn't set its own. */
  pactSpecVersion?: string;
}

/**
 * Writes the Pact files accumulated by `pactPlugin` to disk once a test run finishes,
 * deduplicating interactions that only differ in test data.
 *
 * `pactPlugin` and `pactReporter` must agree on `outputDir` (and other shared options);
 * prefer `pactReporting(options)` to configure both from one object and avoid mismatches.
 */
export function pactReporter({
  outputDir = 'pacts',
  verbose = process.env.PACT_REPORTER_VERBOSE === 'true',
  dedupStrategy = 'structural',
  consumer,
  pactSpecVersion,
}: PactReporterArgs = {}): Reporter {
  const fullOutputDir = path.resolve(process.cwd(), outputDir);
  pactStore.configure('pactReporter', {
    outputDir: fullOutputDir,
    dedupStrategy,
    defaults: { consumer, pactSpecVersion },
  });

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
