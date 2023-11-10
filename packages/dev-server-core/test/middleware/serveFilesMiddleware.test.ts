import { expect } from 'chai';
import path from 'path';

import { createTestServer } from '../helpers.js';

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

      expect(response.status).to.equal(200);
      expect(responseText).to.include("export default 'foo'");
    } finally {
      server.stop();
    }
  });
});
