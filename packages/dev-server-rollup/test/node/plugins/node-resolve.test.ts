import rollupNodeResolve from '@rollup/plugin-node-resolve';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { fromRollup } from '../../../src/index';

const nodeResolve = fromRollup(rollupNodeResolve);

describe('@rollup/plugin-node-resolve', () => {
  it('can resolve imports', async () => {
    const { server, host } = await createTestServer({
      plugins: [nodeResolve()],
    });

    try {
      const text = await fetchText(`${host}/app.js`);
      expectIncludes(text, "import moduleA from './node_modules/module-a/index.js'");
    } finally {
      server.stop();
    }
  });

  it('can resolve imports in inline scripts', async () => {
    const { server, host } = await createTestServer({
      plugins: [nodeResolve()],
    });

    try {
      const text = await fetchText(`${host}/index.html`);
      expectIncludes(text, "import './node_modules/module-a/index.js';");
    } finally {
      server.stop();
    }
  });
});
