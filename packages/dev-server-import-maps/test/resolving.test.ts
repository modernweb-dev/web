import { createTestServer } from '@web/dev-server-core/test-helpers';
import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import path from 'path';

import { assertIncludes, fetchText } from '../../../test-helpers/node.js';
import { importMapsPlugin } from '../dist/importMapsPlugin.js';
import { IMPORT_MAP_PARAM } from '../dist/utils.js';
import { virtualFilesPlugin } from './test-helpers.ts';

function createHtml(importMap: Record<string, unknown>) {
  return `
  <html>
    <head>
      <link rel="preload" href="./app.js">
      <script type="importmap">
        { "imports": ${JSON.stringify(importMap)} }
      </script>
    </head>
    <body>
      <script type="module" src="./app.js"></script>
      <script type="module">
        import "foo";
        import foo from "./bar.js";
      </script>
    </body>
  </html>
`;
}

describe('applies import map id', () => {
  it(`to module scripts`, async () => {
    const files = {
      '/index.html': createHtml({ foo: './mocked-foo.js' }),
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    const text = await fetchText(`${host}/index.html`);
    assertIncludes(text, `<script type="module" src="./app.js?${IMPORT_MAP_PARAM}=0"></script>`);

    server.stop();
  });

  it('to preload links', async () => {
    const files = {
      '/index.html': createHtml({ foo: './mocked-foo.js' }),
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    const text = await fetchText(`${host}/index.html`);
    assertIncludes(text, `<link rel="preload" href="./app.js?${IMPORT_MAP_PARAM}=0">`);

    server.stop();
  });

  it(`to inline modules`, async () => {
    const files = {
      '/index.html': createHtml({ foo: './mocked-foo.js' }),
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    const text = await fetchText(`${host}/index.html`);
    assertIncludes(text, `import "/mocked-foo.js?${IMPORT_MAP_PARAM}=0"`);
    assertIncludes(text, `import foo from "./bar.js?${IMPORT_MAP_PARAM}=0";`);

    server.stop();
  });

  it(`to imports in js files`, async () => {
    const files = {
      '/index.html': createHtml({ foo: './mocked-foo.js' }),
      '/app.js': 'import "foo"; import foo from "./bar.js";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    await fetchText(`${host}/index.html`);
    const text = await fetchText(`${host}/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `import "/mocked-foo.js?${IMPORT_MAP_PARAM}=0"`);
    assertIncludes(text, `import foo from "./bar.js?${IMPORT_MAP_PARAM}=0";`);

    server.stop();
  });

  it(`to imports resolved by other plugins`, async () => {
    const files = {
      '/index.html': createHtml({}),
      '/app.js': 'import "bar";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          resolveImport({ source }) {
            return `RESOLVED__${source}`;
          },
        },
        virtualFilesPlugin(files),
        importMapsPlugin(),
      ],
    });

    await fetchText(`${host}/index.html`);
    const text = await fetchText(`${host}/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `import "RESOLVED__bar?${IMPORT_MAP_PARAM}=0"`);

    server.stop();
  });

  it(`to imports transformed by other plugins`, async () => {
    const files = {
      '/index.html': createHtml({}),
      '/app.js': 'import "bar";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          transformImport({ source }) {
            return `TRANSFORMED__${source}`;
          },
        },
        virtualFilesPlugin(files),
        importMapsPlugin(),
      ],
    });

    await fetchText(`${host}/index.html`);
    const text = await fetchText(`${host}/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `import "TRANSFORMED__bar?${IMPORT_MAP_PARAM}=0"`);

    server.stop();
  });

  it(`to imports that already contain search parameters`, async () => {
    const files = {
      '/index.html': createHtml({}),
      '/app.js': 'import "bar?foo=bar";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    await fetchText(`${host}/index.html`);
    const text = await fetchText(`${host}/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `import "bar?foo=bar&${IMPORT_MAP_PARAM}=0"`);

    server.stop();
  });
});

describe('resolving imports', () => {
  it(`resolves imports in modules`, async () => {
    const files = {
      '/index.html': createHtml({ foo: './mocked-bare-foo.js', './bar.js': './mocked-bar.js' }),
      '/app.js': 'import "foo";\nimport bar from "./bar.js";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    await fetchText(`${host}/index.html`);
    const text = await fetchText(`${host}/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `import "/mocked-bare-foo.js?${IMPORT_MAP_PARAM}=0";`);
    assertIncludes(text, `import bar from "/mocked-bar.js?${IMPORT_MAP_PARAM}=0";`);

    server.stop();
  });

  it(`handles modules in directories`, async () => {
    const files = {
      '/index.html': createHtml({ './bar.js': './mocked-bar.js' }),
      '/x/y/app.js': 'import bar from "../../bar.js";\nimport bar from "../bar.js";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    await fetchText(`${host}/index.html`);
    const text = await fetchText(`${host}/x/y/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `import bar from "/mocked-bar.js?${IMPORT_MAP_PARAM}=0";`);
    assertIncludes(text, `import bar from "../bar.js?${IMPORT_MAP_PARAM}=0";`);

    server.stop();
  });

  it(`leaves unmapped bare imports untouched`, async () => {
    const files = {
      '/index.html': createHtml({ './bar.js': './mocked-bar.js' }),
      '/x/y/app.js': 'import "x";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    await fetchText(`${host}/index.html`);
    const text = await fetchText(`${host}/x/y/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `import "x?${IMPORT_MAP_PARAM}=0";`);

    server.stop();
  });

  it('resolves imports against the document base url', async () => {
    const files = {
      '/x/y/index.html': createHtml({ './bar.js': './mocked-bar.js' }),
      '/x/app.js': 'import "./y/bar.js"; \n import "./bar.js"; \n import "../bar.js";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    await fetchText(`${host}/x/y/index.html`);
    const text = await fetchText(`${host}/x/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `import "/x/y/mocked-bar.js?${IMPORT_MAP_PARAM}=0";`);
    assertIncludes(text, `import "./bar.js?${IMPORT_MAP_PARAM}=0";`);
    assertIncludes(text, `import "../bar.js?${IMPORT_MAP_PARAM}=0";`);

    server.stop();
  });

  it('resolves import maps against an absolute <base href="...">', async () => {
    const files = {
      '/x/y/index.html': `
        <html>
          <head>
            <base href="/foo/" />
            <script type="importmap">
              { "imports": { "bar": "./bar.js" } }
            </script>
          </head>
        </html>`,
      '/x/app.js': 'import "bar";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    await fetchText(`${host}/x/y/index.html`);
    const text = await fetchText(`${host}/x/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `import "/foo/bar.js?${IMPORT_MAP_PARAM}=0";`);

    server.stop();
  });

  it('resolves import maps against a relative <base href="...">', async () => {
    const files = {
      '/x/y/index.html': `
        <html>
          <head>
            <base href="foo/" />
            <script type="importmap">
              { "imports": { "bar": "./bar.js" } }
            </script>
          </head>
        </html>`,
      '/x/app.js': 'import "bar";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    await fetchText(`${host}/x/y/index.html`);
    const text = await fetchText(`${host}/x/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `import "/x/y/foo/bar.js?${IMPORT_MAP_PARAM}=0";`);

    server.stop();
  });

  it(`unchanged import maps does not create new import map ids`, async () => {
    let i = 0;

    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.html') {
              i += 1;
              return i !== 3
                ? createHtml({ foo: './mocked-foo.js' })
                : createHtml({ foo: './not-mocked-foo.js' });
            }
          },
        },
        importMapsPlugin(),
      ],
    });

    const textA = await fetchText(`${host}/foo.html`);
    assertIncludes(textA, `<script type="module" src="./app.js?${IMPORT_MAP_PARAM}=0"></script>`);
    assertIncludes(textA, `import "/mocked-foo.js?${IMPORT_MAP_PARAM}=0"`);
    assertIncludes(textA, `import foo from "./bar.js?${IMPORT_MAP_PARAM}=0";`);

    const textB = await fetchText(`${host}/foo.html`);
    assertIncludes(textB, `<script type="module" src="./app.js?${IMPORT_MAP_PARAM}=0"></script>`);
    assertIncludes(textB, `import "/mocked-foo.js?${IMPORT_MAP_PARAM}=0"`);
    assertIncludes(textB, `import foo from "./bar.js?${IMPORT_MAP_PARAM}=0";`);

    const textC = await fetchText(`${host}/foo.html`);
    assertIncludes(textC, `<script type="module" src="./app.js?${IMPORT_MAP_PARAM}=1"></script>`);
    assertIncludes(textC, `import "/not-mocked-foo.js?${IMPORT_MAP_PARAM}=1"`);
    assertIncludes(textC, `import foo from "./bar.js?${IMPORT_MAP_PARAM}=1";`);

    server.stop();
  });

  it('leaves HTML pages without an import map untouched', async () => {
    const files = {
      '/index.html': '<html><body><script src="./app.js"></script></body></html>',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    const text = await fetchText(`${host}/index.html`);
    assertIncludes(text, '<html><body><script src="./app.js"></script></body></html>');

    server.stop();
  });

  it('returns 200 and logs warning on invalid JSON', async () => {
    const files = {
      '/index.html': `
        <html>
          <head>
          <script type="importmap">{</script>
          </head>
          <body>
            <script src="./app.js"></script>
          </body>
        </html>`,
    };
    const logger = {
      log: mock.fn(),
      debug: mock.fn(),
      error: mock.fn(),
      warn: mock.fn(),
      group: mock.fn(),
      groupEnd: mock.fn(),
      logSyntaxError: mock.fn(),
    };
    const { server, host } = await createTestServer(
      {
        rootDir: import.meta.dirname,
        plugins: [virtualFilesPlugin(files), importMapsPlugin()],
      },
      logger,
    );

    const text = await fetchText(`${host}/index.html`);
    assertIncludes(text, '<script type="importmap">{</script>');
    assert.equal(logger.warn.mock.callCount(), 1);
    const warning = logger.warn.mock.calls[0].arguments[0];
    assertIncludes(warning, 'Failed to parse import map in "');
    assertIncludes(warning, `test${path.sep}index.html": `);
    server.stop();
  });

  it('can remap to complete urls with a different domain', async () => {
    const files = {
      '/index.html': createHtml({ foo: 'https://my-cdn.com/foo/bar.js' }),
      '/app.js': 'import "foo";\nimport bar from "./bar.js";',
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [virtualFilesPlugin(files), importMapsPlugin()],
    });

    await fetchText(`${host}/index.html`);
    const text = await fetchText(`${host}/app.js?${IMPORT_MAP_PARAM}=0`);
    assertIncludes(text, `https://my-cdn.com/foo/bar.js?wds-import-map=0`);

    server.stop();
  });
});
