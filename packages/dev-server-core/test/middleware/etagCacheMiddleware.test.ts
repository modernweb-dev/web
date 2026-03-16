import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';

import { createTestServer, timeout } from '../helpers.ts';
import { DevServer } from '../../src/server/DevServer.ts';

const __dirname = import.meta.dirname;
const fixtureDir = path.resolve(__dirname, '..', 'fixtures', 'basic');
const testFileAName = '/cached-file-a.js';
const testFileBName = '/cached-file-b.js';
const testFileAPath = path.join(fixtureDir, testFileAName);
const testFileBPath = path.join(fixtureDir, testFileBName);

describe('etag cache middleware', () => {
  let host: string;
  let server: DevServer;

  beforeEach(async () => {
    ({ host, server } = await createTestServer());
  });

  afterEach(() => {
    server.stop();
  });

  describe('', () => {
    beforeEach(() => {
      fs.writeFileSync(testFileAPath, '// this file is cached', 'utf-8');
    });

    afterEach(() => {
      fs.unlinkSync(testFileAPath);
    });

    it("returns 304 responses if file hasn't changed", async () => {
      const initialResponse = await fetch(`${host}${testFileAName}`);
      const etag = initialResponse.headers.get('etag')!;

      assert.strictEqual(initialResponse.status, 200);
      assert.strictEqual(await initialResponse.text(), '// this file is cached');

      assert.strictEqual(typeof etag, 'string');

      const cachedResponse = await fetch(`${host}${testFileAName}`, {
        headers: { 'If-None-Match': etag, 'Cache-Control': 'max-age=3600' },
      });

      assert.strictEqual(cachedResponse.status, 304);
      assert.strictEqual(await cachedResponse.text(), '');
    });
  });

  describe('', () => {
    beforeEach(() => {
      fs.writeFileSync(testFileBPath, '// this file is cached', 'utf-8');
    });

    afterEach(() => {
      fs.unlinkSync(testFileBPath);
    });

    it('returns 200 responses if file changed', async () => {
      fs.writeFileSync(testFileBPath, '// this file is cached', 'utf-8');

      const initialResponse = await fetch(`${host}${testFileBName}`);
      const etag = initialResponse.headers.get('etag');

      assert.strictEqual(initialResponse.status, 200);
      assert.strictEqual(await initialResponse.text(), '// this file is cached');
      assert.strictEqual(typeof etag, 'string');

      await timeout(10);
      const fileContent = `// the cache is busted${nanoid()}`;
      fs.writeFileSync(testFileBPath, fileContent, 'utf-8');
      server.fileWatcher.emit('change', testFileBPath);

      const headers = { headers: { 'if-none-match': etag } as Record<string, string> };
      const cachedResponse = await fetch(`${host}${testFileBName}`, headers);

      assert.strictEqual(cachedResponse.status, 200);
      assert.strictEqual(await cachedResponse.text(), fileContent);
    });
  });
});
