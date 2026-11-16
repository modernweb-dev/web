import { TestRunnerPlugin } from '@web/test-runner-core';
import path from 'path';

import {
  PACT_CLEAR_COMMAND,
  PACT_REPORT_COMMAND,
  PACT_WRITE_COMMAND,
  PactDedupStrategy,
  PactReportPayload,
} from './pactContract.js';
import { pactStore } from './pactStore.js';

export interface PactPluginArgs {
  /** Directory to write Pact files to, relative to the project root. */
  outputDir?: string;
  verbose?: boolean;
  /**
   * Strategy for collapsing interactions that only differ in test data. Defaults to
   * `'structural'`; pass `'strict'` to keep every interaction as reported.
   */
  dedupStrategy?: PactDedupStrategy;
  /** Default consumer name, used for any reported payload that doesn't set its own `consumer`. */
  consumer?: { name: string };
  /** Default Pact specification version, used for any payload that doesn't set its own. */
  pactSpecVersion?: string;
}

/**
 * Receives Pact interactions reported from the browser (via `executeServerCommand`)
 * and accumulates them in the shared `pactStore`, for `pactReporter()` to write out.
 *
 * `pactPlugin` and `pactReporter` must agree on `outputDir` (and other shared options);
 * prefer `pactReporting(options)` to configure both from one object and avoid mismatches.
 */
export function pactPlugin({
  outputDir = 'pacts',
  verbose = process.env.PACT_REPORTER_VERBOSE === 'true',
  dedupStrategy = 'structural',
  consumer,
  pactSpecVersion,
}: PactPluginArgs = {}): TestRunnerPlugin<PactReportPayload> {
  const fullOutputDir = path.resolve(process.cwd(), outputDir);
  pactStore.configure('pactPlugin', {
    outputDir: fullOutputDir,
    dedupStrategy,
    defaults: { consumer, pactSpecVersion },
  });

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
