import path from 'path';
import { expect } from 'chai';
import { Plugin as RollupPlugin } from 'rollup';
import { createTestServer, fetchText, expectIncludes } from './test-helpers.js';
import { fromVite, viteAdapter } from '../../src/index.js';
import type { VitePlugin } from '../../src/index.js';

describe('@web/dev-server-rollup - Vite plugin support', () => {
  // ---------------------------------------------------------------------------
  // fromVite / viteAdapter – input validation
  // ---------------------------------------------------------------------------
  describe('fromVite input validation', () => {
    it('throws when called with a non-function', () => {
      expect(() => fromVite(null as unknown as () => VitePlugin)).to.throw(
        'fromVite should be called with a Vite plugin factory function',
      );
    });
  });

  describe('viteAdapter input validation', () => {
    it('throws when called with a non-object', () => {
      expect(() => viteAdapter('not-a-plugin' as unknown as VitePlugin)).to.throw(
        'viteAdapter should be called with a Vite plugin object',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // apply filtering
  // ---------------------------------------------------------------------------
  describe('apply', () => {
    it('skips plugins with apply: "build"', async () => {
      const calls: string[] = [];
      const plugin: VitePlugin = {
        name: 'build-only',
        apply: 'build',
        transform(code) {
          calls.push('transform');
          return `${code}\nconsole.log("should not run");`;
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/app.js`);
        expect(text).to.not.include('should not run');
        expect(calls).to.be.empty;
      } finally {
        server.stop();
      }
    });

    it('applies plugins with apply: "serve"', async () => {
      const plugin: VitePlugin = {
        name: 'serve-plugin',
        apply: 'serve',
        transform(code, id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'app.js')) {
            return `${code}\nconsole.log("served");`;
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, 'console.log("served");');
      } finally {
        server.stop();
      }
    });

    it('applies plugins whose apply function returns true', async () => {
      const plugin: VitePlugin = {
        name: 'conditional-plugin',
        apply: (_config, { command }) => command === 'serve',
        transform(code, id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'app.js')) {
            return `${code}\nconsole.log("conditional");`;
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, 'console.log("conditional");');
      } finally {
        server.stop();
      }
    });

    it('skips plugins whose apply function returns false', async () => {
      const calls: string[] = [];
      const plugin: VitePlugin = {
        name: 'skipped-conditional',
        apply: (_config, { command }) => command === 'build',
        transform(code) {
          calls.push('transform');
          return `${code}\nconsole.log("skipped");`;
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/app.js`);
        expect(text).to.not.include('skipped');
        expect(calls).to.be.empty;
      } finally {
        server.stop();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // resolveId
  // ---------------------------------------------------------------------------
  describe('resolveId', () => {
    it('can resolve imports, returning a string', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        resolveId(id) {
          return `VITE_RESOLVED_${id}`;
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, "import moduleA from 'VITE_RESOLVED_module-a'");
      } finally {
        server.stop();
      }
    });

    it('can resolve imports, returning an object', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        resolveId(id) {
          return { id: `VITE_RESOLVED_${id}` };
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, "import moduleA from 'VITE_RESOLVED_module-a'");
      } finally {
        server.stop();
      }
    });

    it('a resolved file path is resolved relative to the importing file', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        resolveId() {
          return path.join(__dirname, 'fixtures', 'basic', 'src', 'foo.js');
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, "import moduleA from './src/foo.js'");
      } finally {
        server.stop();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // load
  // ---------------------------------------------------------------------------
  describe('load', () => {
    it('can serve files', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        load(id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'src', 'foo.js')) {
            return 'console.log("vite load")';
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/src/foo.js`);
        expectIncludes(text, 'console.log("vite load")');
      } finally {
        server.stop();
      }
    });

    it('can return an object with code', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        load(id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'src', 'foo.js')) {
            return { code: 'console.log("vite load object")' };
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/src/foo.js`);
        expectIncludes(text, 'console.log("vite load object")');
      } finally {
        server.stop();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // transform
  // ---------------------------------------------------------------------------
  describe('transform', () => {
    it('can transform JS, returning a string', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        transform(code, id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'app.js')) {
            return `${code}\nconsole.log("vite transformed");`;
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, 'console.log("vite transformed");');
      } finally {
        server.stop();
      }
    });

    it('can transform JS, returning an object', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        transform(code, id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'app.js')) {
            return { code: `${code}\nconsole.log("vite transformed object");` };
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, 'console.log("vite transformed object");');
      } finally {
        server.stop();
      }
    });

    it('can transform inline scripts in HTML', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        transform(code, id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'foo.html')) {
            return { code: code.replace('foo', 'vite-transformed') };
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/foo.html`);
        expectIncludes(text, 'vite-transformed');
      } finally {
        server.stop();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // transformIndexHtml
  // ---------------------------------------------------------------------------
  describe('transformIndexHtml', () => {
    it('can transform HTML, returning a string', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        transformIndexHtml(html) {
          return html.replace('</body>', '<script>window.__vite = true;</script></body>');
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/index.html`);
        expectIncludes(text, 'window.__vite = true;');
      } finally {
        server.stop();
      }
    });

    it('can transform HTML, returning an array of tag descriptors', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        transformIndexHtml() {
          return [
            {
              tag: 'script',
              attrs: { type: 'module' },
              children: 'window.__injected = true;',
              injectTo: 'body',
            },
          ];
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/index.html`);
        expectIncludes(text, 'window.__injected = true;');
      } finally {
        server.stop();
      }
    });

    it('can transform HTML, returning an object with html and tags', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        transformIndexHtml(html) {
          return {
            html: html.replace('module-a', 'module-b'),
            tags: [
              {
                tag: 'meta',
                attrs: { name: 'vite-plugin', content: 'true' },
                injectTo: 'head',
              },
            ],
          };
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/index.html`);
        expectIncludes(text, 'module-b');
        expectIncludes(text, 'name="vite-plugin"');
      } finally {
        server.stop();
      }
    });

    it('receives the correct path context', async () => {
      let receivedPath: string | undefined;
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        transformIndexHtml(html, ctx) {
          receivedPath = ctx.path;
          return html;
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        await fetchText(`${host}/index.html`);
        expect(receivedPath).to.equal('/index.html');
      } finally {
        server.stop();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // configureServer
  // ---------------------------------------------------------------------------
  describe('configureServer', () => {
    it('can add custom middleware', async () => {
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        configureServer(server) {
          server.middlewares.use((req: any, res: any, next: () => void) => {
            if (req.url === '/custom-endpoint') {
              res.writeHead(200, { 'Content-Type': 'text/plain' });
              res.end('hello from vite plugin');
              return;
            }
            next();
          });
        },
      };
      const { server, host } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        const text = await fetchText(`${host}/custom-endpoint`);
        expectIncludes(text, 'hello from vite plugin');
      } finally {
        server.stop();
      }
    });

    it('exposes the rootDir as config.root', async () => {
      let capturedRoot: string | undefined;
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        configureServer(server) {
          capturedRoot = server.config.root;
        },
      };
      const rootDir = path.resolve(__dirname, 'fixtures', 'basic');
      const { server } = await createTestServer({
        rootDir,
        plugins: [fromVite(() => plugin)()],
      });
      try {
        expect(capturedRoot).to.equal(rootDir);
      } finally {
        server.stop();
      }
    });

    it('supports a post-hook returned from configureServer', async () => {
      const calls: string[] = [];
      const plugin: VitePlugin = {
        name: 'my-vite-plugin',
        configureServer(_server) {
          calls.push('before');
          return () => {
            calls.push('after');
          };
        },
      };
      const { server } = await createTestServer({
        plugins: [fromVite(() => plugin)()],
      });
      try {
        expect(calls).to.deep.equal(['before', 'after']);
      } finally {
        server.stop();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // viteAdapter — direct usage
  // ---------------------------------------------------------------------------
  describe('viteAdapter direct usage', () => {
    it('wraps an already-instantiated Vite plugin', async () => {
      const plugin: VitePlugin = {
        name: 'direct-plugin',
        transform(code, id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'app.js')) {
            return `${code}\nconsole.log("direct adapter");`;
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [viteAdapter(plugin)],
      });
      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, 'console.log("direct adapter");');
      } finally {
        server.stop();
      }
    });
  });
});
