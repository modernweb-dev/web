import { createTestServer } from '@web/dev-server-core/test-helpers';
import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import { posix as pathUtil } from 'path';

import { assertIncludes, assertNotIncludes, fetchText } from '../../../test-helpers/node.js';
import { NAME_HMR_CLIENT_IMPORT } from '../dist/HmrPlugin.js';
import { hmrPlugin } from '../dist/index.js';
import { mockFile, mockFiles } from './utils.ts';

describe('HmrPlugin', () => {
  afterEach(async () => {
    mock.restoreAll();
  });

  it('should emit update for tracked files', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFile(
          '/foo.js',
          `
          import.meta.hot.accept(() => {});
        `,
        ),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = mock.method(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/foo.js'));

      assert.equal(
        stub.mock.calls[0].arguments[0],
        JSON.stringify({
          type: 'hmr:update',
          url: '/foo.js',
        }),
      );
    } finally {
      await server.stop();
    }
  });

  it('should bubble updates for changed dependencies', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFile(
          '/foo.js',
          `import '/bar.js'; import.meta.hot.accept(() => {}); export const a = 1;`,
        ),
        mockFile('/bar.js', `export const b = 2;`),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = mock.method(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      await fetch(`${host}/bar.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/bar.js'));

      assert.equal(
        stub.mock.calls[0].arguments[0],
        JSON.stringify({
          type: 'hmr:update',
          url: '/foo.js',
        }),
      );
    } finally {
      await server.stop();
    }
  });

  it('should not reload if dependent handles change', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFile('/foo.js', `import '/bar.js'; import.meta.hot.accept();`),
        mockFile('/bar.js', `export const s = 808;`),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = mock.method(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      await fetch(`${host}/bar.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/bar.js'));

      assert.equal(stub.mock.callCount(), 1);
      assert.equal(
        stub.mock.calls[0].arguments[0],
        JSON.stringify({
          type: 'hmr:update',
          url: '/foo.js',
        }),
      );
    } finally {
      await server.stop();
    }
  });

  it('should reload if dependents do not handle change', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFile('/foo.js', `import '/bar.js';`),
        mockFile('/bar.js', `export const s = 808;`),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = mock.method(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      await fetch(`${host}/bar.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/bar.js'));

      assert.equal(stub.mock.callCount(), 1);
      assert.equal(
        stub.mock.calls[0].arguments[0],
        JSON.stringify({
          type: 'hmr:reload',
        }),
      );
    } finally {
      await server.stop();
    }
  });

  it('handles dependencies referenced relatively', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFile(
          '/root/foo.js',
          `import './bar.js'; import.meta.hot.accept(() => {}); export const a = 1;`,
        ),
        mockFile('/root/bar.js', `export const b = 2;`),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = mock.method(webSockets!, 'send');
    try {
      await fetch(`${host}/root/foo.js`);
      await fetch(`${host}/root/bar.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/root/bar.js'));

      assert.equal(
        stub.mock.calls[0].arguments[0],
        JSON.stringify({
          type: 'hmr:update',
          url: '/root/foo.js',
        }),
      );
    } finally {
      await server.stop();
    }
  });

  it('should bubble updates for changed dynamic import dependencies', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFile(
          '/foo.js',
          `import('/bar.js'); import.meta.hot.accept(() => {}); export const a = 1;`,
        ),
        mockFile('/bar.js', `export const b = 2;`),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = mock.method(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      await fetch(`${host}/bar.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/bar.js'));

      assert.equal(
        stub.mock.calls[0].arguments[0],
        JSON.stringify({
          type: 'hmr:update',
          url: '/foo.js',
        }),
      );
    } finally {
      await server.stop();
    }
  });

  it('imports changed dependencies with a unique URL', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFiles({
          '/a.js': "import '/b.js'; import '/c.js'; import.meta.hot.accept();",
          '/b.js': '// nothing',
          '/c.js': '// nothing',
        }),
        hmrPlugin(),
      ],
    });
    const { fileWatcher } = server;
    try {
      await fetchText(`${host}/a.js`);
      await fetchText(`${host}/b.js`);
      await fetchText(`${host}/c.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/b.js'));

      const updatedA = await fetchText(`${host}/a.js?m=1234567890123`);
      await fetchText(`${host}/b.js?m=1234567890123`);
      assert.match(updatedA, /import '\/b\.js\?m=\d{13}';/);
      assertIncludes(updatedA, "import '/c.js';");
    } finally {
      await server.stop();
    }
  });

  it('imports deeply changed dependencies with a unique URL', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFiles({
          '/a.js': "import '/b.js'; import.meta.hot.accept();",
          '/b.js': "import '/c.js';",
          '/c.js': '// nothing',
        }),
        hmrPlugin(),
      ],
    });
    const { fileWatcher } = server;
    try {
      await fetchText(`${host}/a.js`);
      await fetchText(`${host}/b.js`);
      await fetchText(`${host}/c.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/c.js'));

      const updatedA = await fetchText(`${host}/a.js?m=1234567890123`);
      const updatedB = await fetchText(`${host}/b.js?m=1234567890123`);
      await fetchText(`${host}/c.js?m=1234567890123`);
      assert.match(updatedA, /import '\/b\.js\?m=\d{13}';/);
      assert.match(updatedB, /import '\/c\.js\?m=\d{13}';/);
    } finally {
      await server.stop();
    }
  });

  it('multiple dependents will import deep dependency changes with a unique URL', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFiles({
          '/a1.js': "import '/b.js'; import.meta.hot.accept(); // a1",
          '/a2.js': "import '/b.js'; import.meta.hot.accept(); // a2",
          '/b.js': "import '/c.js';",
          '/c.js': '// nothing',
        }),
        hmrPlugin(),
      ],
    });
    const { fileWatcher } = server;

    try {
      await fetchText(`${host}/a1.js`);
      await fetchText(`${host}/a2.js`);
      await fetchText(`${host}/b.js`);
      await fetchText(`${host}/c.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/c.js'));

      const updatedA1 = await fetchText(`${host}/a1.js?m=1234567890123`);
      const updatedA2 = await fetchText(`${host}/a2.js?m=1234567890123`);
      await fetchText(`${host}/b.js?m=1234567890123`);
      await fetchText(`${host}/c.js?m=1234567890123`);
      assert.match(updatedA1, /import '\/b\.js\?m=\d{13}';/);
      assert.match(updatedA2, /import '\/b\.js\?m=\d{13}';/);
    } finally {
      await server.stop();
    }
  });

  it('does not get confused by dynamic imports with non string literals', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFile(
          '/foo.js',
          `import '/bar.js'; import.meta.hot.accept(() => {}); export const a = 1; import('./a' + '.js'); import(\`./b/\${x}.js\`);`,
        ),
        mockFile('/bar.js', `export const b = 2;`),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = mock.method(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      await fetch(`${host}/bar.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/bar.js'));

      assert.equal(
        stub.mock.calls[0].arguments[0],
        JSON.stringify({
          type: 'hmr:update',
          url: '/foo.js',
        }),
      );
    } finally {
      await server.stop();
    }
  });

  it('should emit reload for tracked files', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFile(
          '/foo.js',
          `
          export const foo = 5;
        `,
        ),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = mock.method(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      fileWatcher.emit('change', pathUtil.join(import.meta.dirname, '/foo.js'));

      assert.equal(
        stub.mock.calls[0].arguments[0],
        JSON.stringify({
          type: 'hmr:reload',
        }),
      );
    } finally {
      await server.stop();
    }
  });

  it('serves a hmr client', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [hmrPlugin()],
    });

    try {
      const response = await fetch(`${host}${NAME_HMR_CLIENT_IMPORT}`);
      const body = await response.text();
      assertIncludes(body, 'class HotModule');
    } finally {
      await server.stop();
    }
  });

  it('transforms hmr-capable js files', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        mockFile(
          '/foo.js',
          `
          import.meta.hot.accept(() => {});
        `,
        ),
        hmrPlugin(),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const body = await response.text();

      assertIncludes(body, '__WDS_HMR__');
    } finally {
      await server.stop();
    }
  });

  it('does not transform non-hmr js files', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [mockFile('/foo.js', `export const foo = 5;`), hmrPlugin()],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const body = await response.text();

      assertNotIncludes(body, '__WDS_HMR__');
    } finally {
      await server.stop();
    }
  });
});
