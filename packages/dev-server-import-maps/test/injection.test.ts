import { createTestServer, expectNotIncludes } from '@web/dev-server-core/test-helpers';
import { fetchText, expectIncludes, virtualFilesPlugin } from '@web/dev-server-core/test-helpers';

import { importMapsPlugin } from '../src/importMapsPlugin.js';

it('can inject an import map into any page', async () => {
  const { server, host } = await createTestServer({
    rootDir: __dirname,
    plugins: [
      virtualFilesPlugin({
        '/index.html': '<html><body></body></html>',
      }),
      importMapsPlugin({
        inject: {
          importMap: {
            imports: { foo: './bar.js' },
          },
        },
      }),
    ],
  });

  const text = await fetchText(`${host}/index.html`);
  expectIncludes(text, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);

  server.stop();
});

it('can use an include pattern', async () => {
  const { server, host } = await createTestServer({
    rootDir: __dirname,
    plugins: [
      virtualFilesPlugin({
        '/foo/a.html': '<html><body></body></html>',
        '/foo/b.html': '<html><body></body></html>',
        '/bar/a.html': '<html><body></body></html>',
      }),
      importMapsPlugin({
        inject: {
          include: '/foo/**/*',
          importMap: {
            imports: { foo: './bar.js' },
          },
        },
      }),
    ],
  });

  const fooA = await fetchText(`${host}/foo/a.html`);
  const fooB = await fetchText(`${host}/foo/b.html`);
  const barA = await fetchText(`${host}/bar/a.html`);
  expectIncludes(fooA, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);
  expectIncludes(fooB, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);
  expectNotIncludes(barA, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);

  server.stop();
});

it('can use an exclude pattern', async () => {
  const { server, host } = await createTestServer({
    rootDir: __dirname,
    plugins: [
      virtualFilesPlugin({
        '/foo/a.html': '<html><body></body></html>',
        '/foo/b.html': '<html><body></body></html>',
      }),
      importMapsPlugin({
        inject: {
          include: '/foo/**/*',
          exclude: '/foo/b.html',
          importMap: {
            imports: { foo: './bar.js' },
          },
        },
      }),
    ],
  });

  const fooA = await fetchText(`${host}/foo/a.html`);
  const fooB = await fetchText(`${host}/foo/b.html`);
  expectIncludes(fooA, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);
  expectNotIncludes(fooB, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);

  server.stop();
});

it('treats directory paths with an implicit index.html file', async () => {
  const { server, host } = await createTestServer({
    rootDir: __dirname,
    plugins: [
      {
        name: 'test',
        serve(context) {
          if (context.path === '/') {
            return { body: '<html><body></body></html>', type: 'html' };
          }
        },
      },

      importMapsPlugin({
        inject: {
          include: '/index.html',
          importMap: {
            imports: { foo: './bar.js' },
          },
        },
      }),
    ],
  });

  const text = await fetchText(`${host}/`);
  expectIncludes(text, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);

  server.stop();
});

it('merges with an existing import map', async () => {
  const { server, host } = await createTestServer({
    rootDir: __dirname,
    plugins: [
      virtualFilesPlugin({
        '/index.html':
          '<html><head><script type="importmap">' +
          '{"imports":{"foo":"./bar.js"}}' +
          '</script></head><body></body></html>',
      }),
      importMapsPlugin({
        inject: {
          include: '**/*',
          importMap: {
            imports: { bar: './foo.js' },
          },
        },
      }),
    ],
  });

  const text = await fetchText(`${host}/index.html`);
  expectIncludes(
    text.replace(/http:\/\/localhost:(\d){4}/g, '<replaced>'),
    `<script type="importmap">{"imports":{"bar":"<replaced>/foo.js","foo":"<replaced>/bar.js"},"scopes":{}}</script>`,
  );

  server.stop();
});

it('merges import map scopes', async () => {
  const { server, host } = await createTestServer({
    rootDir: __dirname,
    plugins: [
      virtualFilesPlugin({
        '/index.html':
          '<html><head><script type="importmap">' +
          '{ "scopes": { "/foo.js": { "foo": "./bar.js" } } }' +
          '</script></head><body></body></html>',
      }),
      importMapsPlugin({
        inject: {
          include: '**/*',
          importMap: {
            scopes: { '/foo.js': { foo: './bar.js' } },
          },
        },
      }),
    ],
  });

  const text = await fetchText(`${host}/index.html`);
  expectIncludes(
    text.replace(/http:\/\/localhost:(\d){4}/g, '<replaced>'),
    `<script type="importmap">{"imports":{},"scopes":{"<replaced>/foo.js":{"foo":"<replaced>/bar.js"}}}</script>`,
  );

  server.stop();
});

it('the import map in the HTML file takes priority over the injected import map', async () => {
  const { server, host } = await createTestServer({
    rootDir: __dirname,
    plugins: [
      virtualFilesPlugin({
        '/index.html':
          '<html><head><script type="importmap">' +
          '{ "imports": { "foo": "./bar.js" } }' +
          '</script></head><body></body></html>',
      }),
      importMapsPlugin({
        inject: {
          include: '**/*',
          importMap: {
            imports: { foo: './not-bar.js' },
          },
        },
      }),
    ],
  });

  const text = await fetchText(`${host}/index.html`);
  expectIncludes(
    text.replace(/http:\/\/localhost:(\d){4}/g, '<replaced>'),
    `<script type="importmap">{"imports":{"foo":"<replaced>/bar.js"},"scopes":{}}</script>`,
  );

  server.stop();
});
