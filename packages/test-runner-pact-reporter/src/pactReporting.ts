import { Reporter, TestRunnerPlugin } from '@web/test-runner-core';

import { PactDedupStrategy, PactReportPayload } from './pactContract.js';
import { pactPlugin, PactPluginArgs } from './pactPlugin.js';
import { pactReporter } from './pactReporter.js';
import { pactStore } from './pactStore.js';

export interface PactReportingOptions {
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
 * Creates a matching `pactPlugin`/`pactReporter` pair from one shared options object, so
 * `outputDir` (and other options) can never drift apart between the two. This is the
 * recommended way to configure this package; use `pactPlugin()`/`pactReporter()` directly
 * only if you need the plugin and reporter configured differently for some reason.
 *
 * @example
 * ```js
 * const { plugin, reporter } = pactReporting({ outputDir: 'pacts', consumer: { name: 'my-app' } });
 * export default {
 *   plugins: [plugin],
 *   reporters: [defaultReporter(), reporter],
 * };
 * ```
 */
export function pactReporting(options: PactReportingOptions = {}): {
  plugin: TestRunnerPlugin<PactReportPayload>;
  reporter: Reporter;
} {
  const args: PactPluginArgs = options;
  // A pair built here is coherent by construction, so it should never trip the plugin/reporter
  // mismatch guard against configuration registered earlier in this process.
  pactStore.resetConfiguration();
  return {
    plugin: pactPlugin(args),
    reporter: pactReporter(args),
  };
}
