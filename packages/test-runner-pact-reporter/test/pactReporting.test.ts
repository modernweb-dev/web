import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { deduplicateInteractions } from '../dist/pactContract.js';
import { pactPlugin } from '../dist/pactPlugin.js';
import { pactReporter } from '../dist/pactReporter.js';
import { pactReporting } from '../dist/pactReporting.js';
import { pactStore } from '../dist/pactStore.js';

function makeInteraction(overrides = {}) {
  return {
    request: { method: 'GET', path: '/things', ...overrides.request },
    response: { status: 200, body: { id: '1', name: 'a' }, ...overrides.response },
    ...overrides,
  };
}

/** Resets registered plugin/reporter config between tests; config is otherwise process-wide. */
function resetStoreConfig() {
  pactStore.clear();
  pactStore.resetConfiguration();
}

test('deduplicateInteractions with strict strategy keeps every interaction', () => {
  const interactions = [
    makeInteraction({ response: { status: 200, body: { id: '1', name: 'a' } } }),
    makeInteraction({ response: { status: 200, body: { id: '2', name: 'b' } } }),
  ];

  assert.equal(deduplicateInteractions(interactions, 'strict').length, 2);
});

test('pactPlugin and pactReporter configured with mismatched outputDir throws', () => {
  resetStoreConfig();
  const dirA = mkdtempSync(join(tmpdir(), 'pact-reporter-test-a-'));
  const dirB = mkdtempSync(join(tmpdir(), 'pact-reporter-test-b-'));

  try {
    pactPlugin({ outputDir: dirA });
    assert.throws(() => pactReporter({ outputDir: dirB }), /Configuration mismatch/);
  } finally {
    resetStoreConfig();
    rmSync(dirA, { recursive: true, force: true });
    rmSync(dirB, { recursive: true, force: true });
  }
});

test('pactReporting() configures plugin and reporter from one options object without conflict', () => {
  resetStoreConfig();
  const outputDir = mkdtempSync(join(tmpdir(), 'pact-reporter-test-'));

  try {
    const { plugin, reporter } = pactReporting({ outputDir, dedupStrategy: 'strict' });
    assert.ok(plugin);
    assert.ok(reporter);
  } finally {
    resetStoreConfig();
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test('pactReporting() can be called more than once in a process without a false mismatch', () => {
  resetStoreConfig();
  const dirA = mkdtempSync(join(tmpdir(), 'pact-reporter-test-a-'));
  const dirB = mkdtempSync(join(tmpdir(), 'pact-reporter-test-b-'));

  try {
    pactReporting({ outputDir: dirA, dedupStrategy: 'structural' });
    // A second coherent pair must not conflict with the first pair's registration.
    assert.doesNotThrow(() => pactReporting({ outputDir: dirB, dedupStrategy: 'strict' }));
  } finally {
    resetStoreConfig();
    rmSync(dirA, { recursive: true, force: true });
    rmSync(dirB, { recursive: true, force: true });
  }
});

test('pactPlugin applies default consumer/pactSpecVersion when a report omits them', async () => {
  resetStoreConfig();
  const outputDir = mkdtempSync(join(tmpdir(), 'pact-reporter-test-'));

  try {
    const plugin = pactPlugin({
      outputDir,
      consumer: { name: 'default-consumer' },
      pactSpecVersion: '2.0.0',
    });

    await plugin.executeCommand?.({
      command: 'pact:report',
      payload: { provider: { name: 'provider' }, interactions: [makeInteraction()] },
      session: {},
    });

    const writeResult = await plugin.executeCommand?.({ command: 'pact:write', session: {} });
    const written = JSON.parse(
      readFileSync(join(outputDir, writeResult.files[0].filename), 'utf8'),
    );

    assert.equal(written.consumer.name, 'default-consumer');
    assert.equal(written.metadata.pactSpecification.version, '2.0.0');
  } finally {
    resetStoreConfig();
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test('pactStore.write throws when no consumer is set and no default is configured', async () => {
  resetStoreConfig();
  const outputDir = mkdtempSync(join(tmpdir(), 'pact-reporter-test-'));

  try {
    const plugin = pactPlugin({ outputDir });
    await plugin.executeCommand?.({
      command: 'pact:report',
      payload: { provider: { name: 'provider' }, interactions: [makeInteraction()] },
      session: {},
    });

    assert.throws(
      () => plugin.executeCommand?.({ command: 'pact:write', session: {} }),
      /No consumer name set/,
    );
  } finally {
    resetStoreConfig();
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test('written pact files are sorted by description and end with a trailing newline', async () => {
  resetStoreConfig();
  const outputDir = mkdtempSync(join(tmpdir(), 'pact-reporter-test-'));

  try {
    const plugin = pactPlugin({ outputDir, consumer: { name: 'consumer' } });

    await plugin.executeCommand?.({
      command: 'pact:report',
      payload: {
        provider: { name: 'provider' },
        interactions: [
          makeInteraction({ description: 'zebra', request: { path: '/z' } }),
          makeInteraction({ description: 'apple', request: { path: '/a' } }),
        ],
      },
      session: {},
    });

    const writeResult = await plugin.executeCommand?.({ command: 'pact:write', session: {} });
    const filePath = join(outputDir, writeResult.files[0].filename);
    const raw = readFileSync(filePath, 'utf8');

    assert.ok(raw.endsWith('\n'), 'expected a trailing newline');
    const written = JSON.parse(raw);
    assert.deepEqual(
      written.interactions.map(i => i.description),
      ['apple', 'zebra'],
    );
  } finally {
    resetStoreConfig();
    rmSync(outputDir, { recursive: true, force: true });
  }
});
