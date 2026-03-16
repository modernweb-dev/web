import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';

<<<<<<< HEAD
import { createTestServer } from '../helpers.ts';
||||||| parent of aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { createTestServer } from '../helpers.js';
=======
<<<<<<< HEAD
import { createTestServer } from '../helpers.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { createTestServer } from '../helpers.ts';
=======
<<<<<<< HEAD
import { createTestServer } from '../helpers.ts';
||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { createTestServer } from '../helpers.js';
=======
import { createTestServer } from '../helpers.ts';

const __dirname = import.meta.dirname;
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)

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
