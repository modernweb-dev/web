import path from 'path';
import rollupNodeResolve from '@rollup/plugin-node-resolve';
import rollupCommonjs from '@rollup/plugin-commonjs';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers.js';
import { fromRollup } from '../../../src/index.js';
import { expect } from 'chai';

const nodeResolve = fromRollup(rollupNodeResolve, {}, { throwOnUnresolvedImport: true });
const commonjs = fromRollup(rollupCommonjs);

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

  it('can resolve imports in extensionless pages', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        nodeResolve(),
        {
          name: 'test',
          serve(ctx) {
            if (ctx.path === '/index') {
              return { body: '<script type="module">import \'module-a\';</script>', type: 'html' };
            }
          },
        },
      ],
    });

    try {
      const text = await fetchText(`${host}/index`);
      expectIncludes(text, "import './node_modules/module-a/index.js'");
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

  it('can resolve private imports in inline scripts', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.resolve(__dirname, '..', 'fixtures', 'private-imports'),
      plugins: [nodeResolve()],
    });

    try {
      const text = await fetchText(`${host}/index.html`);
      console.log(text);
      expectIncludes(text, "import './internal-a.js';");
    } finally {
      server.stop();
    }
  });

  it('throws when trying to access files from the package directly if they are not exposed in the export map', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.resolve(__dirname, '..', 'fixtures', 'private-imports'),
      plugins: [nodeResolve()],
    });

    try {
      const response = await fetch(`${host}/import-private-directly.html`);
      expect(response.status).to.equal(500);
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

  it('node modules resolved outside root directory with matching basename via symlink are rewritten', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.resolve(__dirname, '..', 'fixtures', 'resolve-outside-dir'),
      plugins: [nodeResolve()],
    });

    try {
      const responseText = await fetchText(`${host}/src/app.js`);
      expectIncludes(
        responseText,
        "import moduleB from '/__wds-outside-root__/1/resolve-outside-dir-foo/index.js'",
      );
    } finally {
      server.stop();
    }
  });

  it('node modules resolved outside root directory are rewritten', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.resolve(__dirname, '..', 'fixtures', 'resolve-outside-dir', 'src'),
      plugins: [nodeResolve()],
    });

    try {
      const responseText = await fetchText(`${host}/app.js`);
      expectIncludes(
        responseText,
        "import moduleA from '/__wds-outside-root__/1/node_modules/module-a/index.js'",
      );
    } finally {
      server.stop();
    }
  });

  it('node modules resolved outside root directory are rewritten with commonjs', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.resolve(__dirname, '..', 'fixtures', 'resolve-outside-dir', 'src'),
      plugins: [commonjs(), nodeResolve()],
    });

    try {
      const responseText = await fetchText(`${host}/app.js`);
      expectIncludes(
        responseText,
        "import moduleA from '/__wds-outside-root__/1/node_modules/module-a/index.js'",
      );
    } finally {
      server.stop();
    }
  });
});
