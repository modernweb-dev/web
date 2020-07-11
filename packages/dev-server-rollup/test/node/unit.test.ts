import { Plugin as RollupPlugin, AcornNode } from 'rollup';
import { expect } from 'chai';
import path from 'path';

import { createTestServer, fetchText, expectIncludes } from './test-helpers';
import { rollupAdapter } from '../../src/rollupAdapter';

describe('es-dev-server-rollup', () => {
  describe('resolveId', () => {
    it('can resolve imports, returning a string', async () => {
      const plugin: RollupPlugin = {
        name: 'my-plugin',
        resolveId(id) {
          return `RESOLVED_${id}`;
        },
      };
      const { server, host } = await createTestServer({
        plugins: [rollupAdapter(plugin)],
      });

      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, "import moduleA from 'RESOLVED_module-a'");
      } finally {
        server.stop();
      }
    });

    it('can resolve imports, returning an object', async () => {
      const plugin: RollupPlugin = {
        name: 'my-plugin',
        resolveId(id) {
          return { id: `RESOLVED_${id}` };
        },
      };
      const { server, host } = await createTestServer({
        plugins: [rollupAdapter(plugin)],
      });

      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, "import moduleA from 'RESOLVED_module-a'");
      } finally {
        server.stop();
      }
    });

    it('can resolve imports in inline scripts', async () => {
      const plugin: RollupPlugin = {
        name: 'my-plugin',
        resolveId(id) {
          return { id: `RESOLVED_${id}` };
        },
      };
      const { server, host } = await createTestServer({
        plugins: [rollupAdapter(plugin)],
      });

      try {
        const text = await fetchText(`${host}/index.html`);
        expectIncludes(text, "import 'RESOLVED_module-a'");
      } finally {
        server.stop();
      }
    });

    it('a resolved file path is resolved relative to the importing file', async () => {
      const plugin: RollupPlugin = {
        name: 'my-plugin',
        resolveId() {
          return path.join(__dirname, 'fixtures', 'basic', 'src', 'foo.js');
        },
      };
      const { server, host } = await createTestServer({
        plugins: [rollupAdapter(plugin)],
      });

      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, "import moduleA from './src/foo.js'");
      } finally {
        server.stop();
      }
    });
  });

  describe('load', () => {
    it('can serve files', async () => {
      const plugin: RollupPlugin = {
        name: 'my-plugin',
        load(id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'src', 'foo.js')) {
            return 'console.log("hello world")';
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [rollupAdapter(plugin)],
      });

      try {
        const text = await fetchText(`${host}/src/foo.js`);
        expectIncludes(text, 'console.log("hello world")');
      } finally {
        server.stop();
      }
    });

    it('can return an object', async () => {
      const plugin: RollupPlugin = {
        name: 'my-plugin',
        load(id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'src', 'foo.js')) {
            return { code: 'console.log("hello world")' };
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [rollupAdapter(plugin)],
      });

      try {
        const text = await fetchText(`${host}/src/foo.js`);
        expectIncludes(text, 'console.log("hello world")');
      } finally {
        server.stop();
      }
    });
  });

  describe('transform', () => {
    it('can return a string', async () => {
      const plugin: RollupPlugin = {
        name: 'my-plugin',
        transform(code, id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'app.js')) {
            return `${code}\nconsole.log("transformed");`;
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [rollupAdapter(plugin)],
      });

      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, 'console.log("transformed");');
      } finally {
        server.stop();
      }
    });

    it('can return an object', async () => {
      const plugin: RollupPlugin = {
        name: 'my-plugin',
        transform(code, id) {
          if (id === path.join(__dirname, 'fixtures', 'basic', 'app.js')) {
            return { code: `${code}\nconsole.log("transformed");` };
          }
        },
      };
      const { server, host } = await createTestServer({
        plugins: [rollupAdapter(plugin)],
      });

      try {
        const text = await fetchText(`${host}/app.js`);
        expectIncludes(text, 'console.log("transformed");');
      } finally {
        server.stop();
      }
    });
  });

  it('rollup plugins can use this.parse', async () => {
    let parsed: AcornNode | undefined = undefined;
    const plugin: RollupPlugin = {
      name: 'my-plugin',
      transform(code, id) {
        if (id === path.join(__dirname, 'fixtures', 'basic', 'app.js')) {
          parsed = this.parse(code, {});
          return undefined;
        }
      },
    };
    const { server, host } = await createTestServer({
      plugins: [rollupAdapter(plugin)],
    });

    try {
      await fetchText(`${host}/app.js`);
      expect(parsed).to.exist;
    } finally {
      server.stop();
    }
  });

  it('rewrites injected imports with file paths to browser paths', async () => {
    const plugin: RollupPlugin = {
      name: 'my-plugin',
      transform(code, id) {
        if (id === path.join(__dirname, 'fixtures', 'basic', 'app.js')) {
          return `import "${path.join(__dirname, 'fixtures', 'basic', 'foo.js')}";\n${code}`;
        }
      },
    };
    const { server, host } = await createTestServer({
      plugins: [rollupAdapter(plugin)],
    });

    try {
      const text = await fetchText(`${host}/app.js`);
      expectIncludes(text, 'import "./foo.js"');
    } finally {
      server.stop();
    }
  });

  it('imports with a null byte are rewritten to a special URL', async () => {
    const plugin: RollupPlugin = {
      name: 'my-plugin',
      load(id) {
        if (id === path.join(__dirname, 'fixtures', 'basic', 'app.js')) {
          return 'import "\0foo.js";';
        }
      },
      resolveId(id) {
        if (id === '\0foo.js') {
          return id;
        }
      },
    };
    const { server, host } = await createTestServer({
      plugins: [rollupAdapter(plugin)],
    });

    try {
      const text = await fetchText(`${host}/app.js`);
      expectIncludes(
        text,
        'import "/__web-dev-server__/?web-dev-server-rollup-null-byte=%00foo.js"',
      );
    } finally {
      server.stop();
    }
  });

  it('requests with a null byte are receives by the rollup plugin without special prefix', async () => {
    const plugin: RollupPlugin = {
      name: 'my-plugin',
      load(id) {
        if (id === '\0foo.js') {
          return 'console.log("foo");';
        }
      },
    };
    const { server, host } = await createTestServer({
      plugins: [rollupAdapter(plugin)],
    });

    try {
      const text = await fetchText(
        `${host}/__web-dev-server__/?web-dev-server-rollup-null-byte=%00foo.js`,
      );
      expectIncludes(text, 'console.log("foo");');
    } finally {
      server.stop();
    }
  });
});
