import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { deduplicateInteractions } from '../dist/pactContract.js';
import { pactPlugin } from '../dist/pactPlugin.js';
import { pactStore } from '../dist/pactStore.js';

function makeInteraction(overrides = {}) {
  return {
    request: { method: 'GET', path: '/things', ...overrides.request },
    response: { status: 200, body: { id: '1', name: 'a' }, ...overrides.response },
    ...overrides,
  };
}

test('deduplicateInteractions collapses same-shape interactions with different data', () => {
  const interactions = [
    makeInteraction({ response: { status: 200, body: { id: '1', name: 'a' } } }),
    makeInteraction({ response: { status: 200, body: { id: '2', name: 'b' } } }),
  ];

  assert.equal(deduplicateInteractions(interactions).length, 1);
});

test('deduplicateInteractions keeps interactions with a different response schema', () => {
  const interactions = [
    makeInteraction({ response: { status: 200, body: { id: '1' } } }),
    makeInteraction({ response: { status: 404, body: { error: 'not found' } } }),
  ];

  assert.equal(deduplicateInteractions(interactions).length, 2);
});

test('pactStore.report rejects a payload without a provider name', () => {
  pactStore.clear();
  const result = pactStore.report({ interactions: [] });
  assert.deepEqual(result, { success: false, error: 'Invalid pact payload' });
});

test('pactStore.report merges interactions reported for the same provider', () => {
  pactStore.clear();
  const pactFile = {
    consumer: { name: 'consumer' },
    provider: { name: 'provider' },
    interactions: [makeInteraction()],
    metadata: { pactSpecification: { version: '3.0.0' } },
  };

  pactStore.report(pactFile);
  pactStore.report({ ...pactFile, interactions: [makeInteraction()] });

  assert.equal(pactStore.size, 1);
  assert.equal(pactStore.interactionCount, 2);
});

test('pactPlugin executeCommand handles pact:report, pact:clear and pact:write', async () => {
  pactStore.clear();
  const outputDir = mkdtempSync(join(tmpdir(), 'pact-reporter-test-'));
  const plugin = pactPlugin({ outputDir });

  try {
    const pactFile = {
      consumer: { name: 'consumer' },
      provider: { name: 'provider' },
      interactions: [makeInteraction()],
      metadata: { pactSpecification: { version: '3.0.0' } },
    };

    const reportResult = await plugin.executeCommand?.({
      command: 'pact:report',
      payload: pactFile,
      session: {} as any,
    });
    assert.deepEqual(reportResult, { success: true, provider: 'provider', interactionCount: 1 });

    const writeResult: any = await plugin.executeCommand?.({
      command: 'pact:write',
      session: {} as any,
    });
    assert.equal(writeResult.files.length, 1);

    const written = JSON.parse(readFileSync(join(outputDir, 'consumer-provider.json'), 'utf8'));
    assert.equal(written.provider.name, 'provider');

    const clearResult = await plugin.executeCommand?.({
      command: 'pact:clear',
      session: {} as any,
    });
    assert.deepEqual(clearResult, { success: true });
    assert.equal(pactStore.size, 0);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});
