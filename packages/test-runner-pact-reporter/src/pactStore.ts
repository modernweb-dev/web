import fs from 'fs';
import path from 'path';

import {
  deduplicateInteractions,
  PactFile,
  PactReportResult,
  PactWriteResult,
} from './pactContract.js';

/**
 * Accumulates Pact files reported from the browser, keyed by provider name, and
 * flushes them to disk. A process-wide singleton so the plugin (which receives
 * reports) and the reporter (which writes them out) share the same state.
 */
class PactStore {
  private files = new Map<string, PactFile>();

  report(payload: PactFile | undefined): PactReportResult {
    if (!payload?.provider?.name) {
      return { success: false, error: 'Invalid pact payload' };
    }

    const provider = payload.provider.name;
    const existing = this.files.get(provider);
    if (existing) {
      existing.interactions.push(...payload.interactions);
    } else {
      this.files.set(provider, payload);
    }

    return { success: true, provider, interactionCount: payload.interactions.length };
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

    const files: PactWriteResult['files'] = [];
    for (const [provider, pactFile] of this.files) {
      pactFile.interactions = deduplicateInteractions(pactFile.interactions);

      const filename = `${pactFile.consumer.name}-${pactFile.provider.name}.json`;
      fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(pactFile, null, 2));

      files.push({ provider, filename, interactionCount: pactFile.interactions.length });
    }

    return { success: true, files };
  }
}

export const pactStore = new PactStore();
