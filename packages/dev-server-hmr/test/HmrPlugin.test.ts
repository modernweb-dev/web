import { expect } from 'chai';
import { Context } from 'koa';
import fetch from 'node-fetch';
import { stubMethod, restore as restoreStubs } from 'hanbi';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { hmrPlugin } from '../src/index';
import { NAME_HMR_CLIENT_IMPORT } from '../src/HmrPlugin';
import { posix as pathUtil } from 'path';

const mockFile = (path: string, source: string) => ({
  name: `test-file:${path}`,
  serve: (context: Context) => {
    if (context.path === path) {
      return source;
    }
  },
});

describe('HmrPlugin', () => {
  afterEach(() => {
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
    const stub = stubMethod(webSockets, 'send');
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
    const stub = stubMethod(webSockets, 'send');
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
    const stub = stubMethod(webSockets, 'send');
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
    const stub = stubMethod(webSockets, 'send');
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
    const stub = stubMethod(webSockets, 'send');
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
    const stub = stubMethod(webSockets, 'send');
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
