import { createTestServer } from '@web/dev-server-core/test-helpers';
import { it } from 'node:test';

import {
  assertIncludes,
  assertNotIncludes,
  fetchText,
} from '../../../test-helpers/node-test-helpers.js';
import { importMapsPlugin } from '../dist/importMapsPlugin.js';
import { virtualFilesPlugin } from './test-helpers.ts';

it('can inject an import map into any page', async () => {
  const { server, host } = await createTestServer({
    rootDir: import.meta.dirname,
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
  assertIncludes(text, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);

  server.stop();
});

it('can use an include pattern', async () => {
  const { server, host } = await createTestServer({
    rootDir: import.meta.dirname,
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
  assertIncludes(fooA, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);
  assertIncludes(fooB, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);
  assertNotIncludes(barA, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);

  server.stop();
});

it('can use an exclude pattern', async () => {
  const { server, host } = await createTestServer({
    rootDir: import.meta.dirname,
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
  assertIncludes(fooA, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);
  assertNotIncludes(fooB, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);

  server.stop();
});

it('treats directory paths with an implicit index.html file', async () => {
  const { server, host } = await createTestServer({
    rootDir: import.meta.dirname,
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
  assertIncludes(text, `<script type="importmap">{"imports":{"foo":"./bar.js"}}</script>`);

  server.stop();
});

it('merges with an existing import map', async () => {
  const { server, host } = await createTestServer({
    rootDir: import.meta.dirname,
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
  assertIncludes(
    text.replace(/http:\/\/localhost:(\d){4}/g, '<replaced>'),
    `<script type="importmap">{"imports":{"bar":"<replaced>/foo.js","foo":"<replaced>/bar.js"},"scopes":{}}</script>`,
  );

  server.stop();
});

it('merges import map scopes', async () => {
  const { server, host } = await createTestServer({
    rootDir: import.meta.dirname,
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
  assertIncludes(
    text.replace(/http:\/\/localhost:(\d){4}/g, '<replaced>'),
    `<script type="importmap">{"imports":{},"scopes":{"<replaced>/foo.js":{"foo":"<replaced>/bar.js"}}}</script>`,
  );

  server.stop();
});

it('the import map in the HTML file takes priority over the injected import map', async () => {
  const { server, host } = await createTestServer({
    rootDir: import.meta.dirname,
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
  assertIncludes(
    text.replace(/http:\/\/localhost:(\d){4}/g, '<replaced>'),
    `<script type="importmap">{"imports":{"foo":"<replaced>/bar.js"},"scopes":{}}</script>`,
  );

  server.stop();
});
