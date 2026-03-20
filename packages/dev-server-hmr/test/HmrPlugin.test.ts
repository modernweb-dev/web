import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { stubMethod, restore as restoreStubs } from 'hanbi';
import { createTestServer, fetchText, expectIncludes } from '@web/dev-server-core/test-helpers';
import { posix as pathUtil } from 'path';

import { hmrPlugin } from '../src/index.ts';
import { NAME_HMR_CLIENT_IMPORT } from '../src/HmrPlugin.ts';
import { mockFile, mockFiles } from './utils.ts';

const __dirname = import.meta.dirname;

describe('HmrPlugin', () => {
  afterEach(async () => {
    restoreStubs();
  });

  it('should emit update for tracked files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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
    const stub = stubMethod(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      fileWatcher.emit('change', pathUtil.join(__dirname, '/foo.js'));

      assert.equal(
        stub.firstCall!.args[0],
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
      rootDir: __dirname,
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
    const stub = stubMethod(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      await fetch(`${host}/bar.js`);
      fileWatcher.emit('change', pathUtil.join(__dirname, '/bar.js'));

      assert.equal(
        stub.firstCall!.args[0],
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
      rootDir: __dirname,
      plugins: [
        mockFile('/foo.js', `import '/bar.js'; import.meta.hot.accept();`),
        mockFile('/bar.js', `export const s = 808;`),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = stubMethod(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      await fetch(`${host}/bar.js`);
      fileWatcher.emit('change', pathUtil.join(__dirname, '/bar.js'));

      assert.equal(stub.callCount, 1);
      assert.equal(
        stub.firstCall!.args[0],
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
      rootDir: __dirname,
      plugins: [
        mockFile('/foo.js', `import '/bar.js';`),
        mockFile('/bar.js', `export const s = 808;`),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = stubMethod(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      await fetch(`${host}/bar.js`);
      fileWatcher.emit('change', pathUtil.join(__dirname, '/bar.js'));

      assert.equal(stub.callCount, 1);
      assert.equal(
        stub.firstCall!.args[0],
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
      rootDir: __dirname,
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
    const stub = stubMethod(webSockets!, 'send');
    try {
      await fetch(`${host}/root/foo.js`);
      await fetch(`${host}/root/bar.js`);
      fileWatcher.emit('change', pathUtil.join(__dirname, '/root/bar.js'));

      assert.equal(
        stub.firstCall!.args[0],
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
      rootDir: __dirname,
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
    const stub = stubMethod(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      await fetch(`${host}/bar.js`);
      fileWatcher.emit('change', pathUtil.join(__dirname, '/bar.js'));

      assert.equal(
        stub.firstCall!.args[0],
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
      rootDir: __dirname,
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
      fileWatcher.emit('change', pathUtil.join(__dirname, '/b.js'));

      const updatedA = await fetchText(`${host}/a.js?m=1234567890123`);
      await fetchText(`${host}/b.js?m=1234567890123`);
      assert.equal(/import '\/b\.js\?m=\d{13}';/.test(updatedA), true);
      expectIncludes(updatedA, "import '/c.js';");
    } finally {
      await server.stop();
    }
  });

  it('imports deeply changed dependencies with a unique URL', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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
      fileWatcher.emit('change', pathUtil.join(__dirname, '/c.js'));

      const updatedA = await fetchText(`${host}/a.js?m=1234567890123`);
      const updatedB = await fetchText(`${host}/b.js?m=1234567890123`);
      await fetchText(`${host}/c.js?m=1234567890123`);
      assert.equal(/import '\/b\.js\?m=\d{13}';/.test(updatedA), true);
      assert.equal(/import '\/c\.js\?m=\d{13}';/.test(updatedB), true);
    } finally {
      await server.stop();
    }
  });

  it('multiple dependents will import deep dependency changes with a unique URL', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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
      fileWatcher.emit('change', pathUtil.join(__dirname, '/c.js'));

      const updatedA1 = await fetchText(`${host}/a1.js?m=1234567890123`);
      const updatedA2 = await fetchText(`${host}/a2.js?m=1234567890123`);
      await fetchText(`${host}/b.js?m=1234567890123`);
      await fetchText(`${host}/c.js?m=1234567890123`);
      assert.equal(/import '\/b\.js\?m=\d{13}';/.test(updatedA1), true);
      assert.equal(/import '\/b\.js\?m=\d{13}';/.test(updatedA2), true);
    } finally {
      await server.stop();
    }
  });

  it('does not get confused by dynamic imports with non string literals', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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
    const stub = stubMethod(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      await fetch(`${host}/bar.js`);
      fileWatcher.emit('change', pathUtil.join(__dirname, '/bar.js'));

      assert.equal(
        stub.firstCall!.args[0],
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
      rootDir: __dirname,
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
    const stub = stubMethod(webSockets!, 'send');
    try {
      await fetch(`${host}/foo.js`);
      fileWatcher.emit('change', pathUtil.join(__dirname, '/foo.js'));

      assert.equal(
        stub.firstCall!.args[0],
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
      rootDir: __dirname,
      plugins: [hmrPlugin()],
    });

    try {
      const response = await fetch(`${host}${NAME_HMR_CLIENT_IMPORT}`);
      const body = await response.text();
      assert.equal(body.includes('class HotModule'), true);
    } finally {
      await server.stop();
    }
  });

  it('transforms hmr-capable js files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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

      assert.equal(body.includes('__WDS_HMR__'), true);
    } finally {
      await server.stop();
    }
  });

  it('does not transform non-hmr js files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [mockFile('/foo.js', `export const foo = 5;`), hmrPlugin()],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const body = await response.text();

      assert.equal(body.includes('__WDS_HMR__'), false);
    } finally {
      await server.stop();
    }
  });
});
