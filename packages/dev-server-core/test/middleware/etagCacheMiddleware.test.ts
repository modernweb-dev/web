import { expect } from 'chai';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

import { createTestServer, timeout } from '../helpers';
import { DevServer } from '../../src/server/DevServer';

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

  context('', () => {
    beforeEach(() => {
      fs.writeFileSync(testFileAPath, '// this file is cached', 'utf-8');
    });

    afterEach(() => {
      fs.unlinkSync(testFileAPath);
    });

    it("returns 304 responses if file hasn't changed", async () => {
      const initialResponse = await fetch(`${host}${testFileAName}`);
      const etag = initialResponse.headers.get('etag');

      expect(initialResponse.status).to.equal(200);
      expect(await initialResponse.text()).to.equal('// this file is cached');

      expect(etag).to.be.a('string');

      const headers = { headers: { 'if-none-match': etag } as Record<string, string> };
      const cachedResponse = await fetch(`${host}${testFileAName}`, headers);

      expect(cachedResponse.status).to.equal(304);
      expect(await cachedResponse.text()).to.equal('');
    });
  });

  context('', () => {
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

      expect(initialResponse.status).to.equal(200);
      expect(await initialResponse.text()).to.equal('// this file is cached');
      expect(etag).to.be.a('string');

      await timeout(10);
      const fileContent = `// the cache is busted${uuid()}`;
      fs.writeFileSync(testFileBPath, fileContent, 'utf-8');
      server.fileWatcher.emit('change', testFileBPath);

      const headers = { headers: { 'if-none-match': etag } as Record<string, string> };
      const cachedResponse = await fetch(`${host}${testFileBName}`, headers);

      expect(cachedResponse.status).to.equal(200);
      expect(await cachedResponse.text()).to.equal(fileContent);
    });
  });
});
