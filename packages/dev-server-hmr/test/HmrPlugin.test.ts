import { expect } from 'chai';
import { stubMethod, restore as restoreStubs } from 'hanbi';
import { createTestServer, fetchText, expectIncludes } from '@web/dev-server-core/test-helpers';
import { posix as pathUtil } from 'path';

import { hmrPlugin } from '../src/index.js';
import { NAME_HMR_CLIENT_IMPORT } from '../src/HmrPlugin.js';
import { mockFile, mockFiles } from './utils.js';

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

      expect(stub.firstCall!.args[0]).to.equal(
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

      expect(stub.firstCall!.args[0]).to.equal(
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

      expect(stub.callCount).to.equal(1);
      expect(stub.firstCall!.args[0]).to.equal(
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

      expect(stub.callCount).to.equal(1);
      expect(stub.firstCall!.args[0]).to.equal(
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

      expect(stub.firstCall!.args[0]).to.equal(
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

      expect(stub.firstCall!.args[0]).to.equal(
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
      expect(/import '\/b\.js\?m=\d{13}';/.test(updatedA)).to.equal(true);
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
      expect(/import '\/b\.js\?m=\d{13}';/.test(updatedA)).to.equal(true);
      expect(/import '\/c\.js\?m=\d{13}';/.test(updatedB)).to.equal(true);
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
      expect(/import '\/b\.js\?m=\d{13}';/.test(updatedA1)).to.equal(true);
      expect(/import '\/b\.js\?m=\d{13}';/.test(updatedA2)).to.equal(true);
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

      expect(stub.firstCall!.args[0]).to.equal(
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

      expect(stub.firstCall!.args[0]).to.equal(
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
      expect(body.includes('class HotModule')).to.equal(true);
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

      expect(body.includes('__WDS_HMR__')).to.equal(true);
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

      expect(body.includes('__WDS_HMR__')).to.equal(false);
    } finally {
      await server.stop();
    }
  });
});
