import rollupNodeResolve from '@rollup/plugin-node-resolve';
import fetch from 'node-fetch';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { fromRollup } from '../../../src/index';
import { expect } from 'chai';

const nodeResolve = fromRollup(rollupNodeResolve, {}, { throwOnUnresolvedImport: true });

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

  it('throws on unresolved bare imports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        nodeResolve(),
        {
          name: 'test',
          serve(ctx) {
            if (ctx.path === '/test-app.js') {
              return 'import "non-existing"';
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/test-app.js`);
      expect(response.status).to.equal(500);
    } finally {
      server.stop();
    }
  });

  it('does not throw on unresolved relative or absolute imports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        nodeResolve(),
        {
          name: 'test',
          serve(ctx) {
            if (ctx.path === '/test-app.js') {
              return 'import "/non-existing.js"; import "./src/non-existing.js";';
            }
          },
        },
      ],
    });

    try {
      const text = await fetchText(`${host}/test-app.js`);
      expect(text).to.equal('import "/non-existing.js"; import "./src/non-existing.js";');
    } finally {
      server.stop();
    }
  });
});
