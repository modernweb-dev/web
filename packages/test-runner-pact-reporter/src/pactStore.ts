import fs from 'fs';
import path from 'path';

import {
  deduplicateInteractions,
  PactDedupStrategy,
  PactDefaults,
  PactFile,
  PactReportPayload,
  PactReportResult,
  PactWriteResult,
} from './pactContract.js';

/** Resolved configuration registered by `pactPlugin`/`pactReporter`. */
interface RegisteredConfig {
  outputDir: string;
  dedupStrategy: PactDedupStrategy;
  defaults: PactDefaults;
}

/**
 * Accumulates Pact files reported from the browser, keyed by provider name, and
 * flushes them to disk. A process-wide singleton so the plugin (which receives
 * reports) and the reporter (which writes them out) share the same state.
 */
class PactStore {
  private files = new Map<string, PactReportPayload>();
  // Tracked per-owner (rather than a single slot) so re-registering the same owner, e.g. when
  // a config factory is reloaded, doesn't falsely conflict with its own previous registration.
  private configs = new Map<'pactPlugin' | 'pactReporter', RegisteredConfig>();

  /**
   * Registers the resolved options from `pactPlugin`/`pactReporter`. Throws if the other side
   * already registered different options, to catch split-brain configuration before any files
   * are written. Use `pactReporting()` to avoid this entirely by sharing one options object
   * between the plugin and reporter.
   */
  configure(owner: 'pactPlugin' | 'pactReporter', config: RegisteredConfig): void {
    const other = owner === 'pactPlugin' ? 'pactReporter' : 'pactPlugin';
    const otherConfig = this.configs.get(other);
    if (otherConfig) {
      const mismatchedKey = (['outputDir', 'dedupStrategy'] as const).find(
        key => otherConfig[key] !== config[key],
      );
      if (mismatchedKey) {
        throw new Error(
          `[@web/test-runner-pact-reporter] Configuration mismatch: ${other} is configured ` +
            `with ${mismatchedKey} "${otherConfig[mismatchedKey]}", but ${owner} is configured ` +
            `with ${mismatchedKey} "${config[mismatchedKey]}". pactPlugin and pactReporter must ` +
            `agree on this option. Consider using pactReporting(options) to share one options ` +
            `object between both.`,
        );
      }
    }
    this.configs.set(owner, config);
  }

  /**
   * Drops any previously registered plugin/reporter configuration. Called by `pactReporting()`
   * before it builds a fresh, coherent plugin/reporter pair, so that creating a pair never
   * conflicts with a configuration registered earlier in the same process.
   */
  resetConfiguration(): void {
    this.configs.clear();
  }

  private get config(): RegisteredConfig | undefined {
    return this.configs.get('pactPlugin') ?? this.configs.get('pactReporter');
  }

  report(payload: PactReportPayload | undefined): PactReportResult {
    if (!payload?.provider?.name) {
      return { success: false, error: 'Invalid pact payload' };
    }

    const resolved = this.applyDefaults(payload);
    const provider = resolved.provider.name;
    const existing = this.files.get(provider);
    if (existing) {
      existing.interactions.push(...resolved.interactions);
    } else {
      this.files.set(provider, resolved);
    }

    return { success: true, provider, interactionCount: resolved.interactions.length };
  }

  clear(): void {
    this.files.clear();
  }

  get size(): number {
    return this.files.size;
  }

  get interactionCount(): number {
    return Array.from(this.files.values()).reduce(
      (sum, pactFile) => sum + pactFile.interactions.length,
      0,
    );
  }

  write(outputDir: string): PactWriteResult {
    fs.mkdirSync(outputDir, { recursive: true });

    const dedupStrategy = this.config?.dedupStrategy ?? 'structural';
    const files: PactWriteResult['files'] = [];
    for (const [provider, payload] of this.files) {
      const pactFile = this.toPactFile(payload, dedupStrategy);

      const filename = `${pactFile.consumer.name}-${pactFile.provider.name}.json`;
      // Trailing newline keeps generated files diff-friendly (most editors/linters expect one).
      fs.writeFileSync(path.join(outputDir, filename), `${JSON.stringify(pactFile, null, 2)}\n`);

      files.push({ provider, filename, interactionCount: pactFile.interactions.length });
    }

    return { success: true, files };
  }

  /** Fills in consumer/metadata from registered defaults when a payload omits them. */
  private applyDefaults(payload: PactReportPayload): PactReportPayload {
    const defaults = this.config?.defaults;
    return {
      ...payload,
      consumer: payload.consumer ?? defaults?.consumer,
      metadata: {
        ...payload.metadata,
        pactSpecification: {
          version:
            payload.metadata?.pactSpecification?.version ?? defaults?.pactSpecVersion ?? '3.0.0',
        },
      },
    };
  }

  /** Deduplicates and sorts interactions (by description) for reproducible, diff-friendly output. */
  private toPactFile(payload: PactReportPayload, dedupStrategy: PactDedupStrategy): PactFile {
    if (!payload.consumer?.name) {
      throw new Error(
        '[@web/test-runner-pact-reporter] No consumer name set for reported pact file, and no ' +
          'default consumer configured. Pass { consumer: { name } } when reporting, or set a ' +
          'default via pactPlugin({ consumer }) / pactReporting({ consumer }).',
      );
    }

    const interactions = deduplicateInteractions(payload.interactions, dedupStrategy).sort((a, b) =>
      (a.description ?? '').localeCompare(b.description ?? ''),
    );

    return {
      consumer: payload.consumer,
      provider: payload.provider,
      interactions,
      metadata: {
        pactSpecification: { version: payload.metadata?.pactSpecification?.version ?? '3.0.0' },
        client: payload.metadata?.client,
      },
    };
  }
}

export const pactStore = new PactStore();
