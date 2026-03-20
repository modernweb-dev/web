import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';

import { createTestServer } from '../helpers.ts';

const __dirname = import.meta.dirname;

describe('serveFilesMiddleware', () => {
  it('can serve files outside of the root directory', async () => {
    const { host, server } = await createTestServer({
      plugins: [{ name: 'test' }],
      rootDir: path.resolve(
        __dirname,
        '..',
        'fixtures',
        'outside-root-dir',
        'packages',
        'package-a',
      ),
    });

    try {
      const response = await fetch(`${host}/__wds-outside-root__/2/node_modules/foo/index.js`);
      const responseText = await response.text();

      assert.strictEqual(response.status, 200);
      assert.ok(responseText.includes("export default 'foo'"));
    } finally {
      server.stop();
    }
  });
});
