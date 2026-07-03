import { createTestServer } from '@web/dev-server-core/test-helpers';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertIncludes, fetchText } from '../../../test-helpers/node-test-helpers.js';
// rewrite to ../src/legacyPlugin.ts when TS 5.7+ / rewriteRelativeImportExtensions
import { legacyPlugin } from '../dist/legacyPlugin.js';
import { legacyUserAgents, modernUserAgents } from './userAgents.ts';

const htmlBody = `
<html>
<body>
  <script type="module" src="./foo.js"></script>
  <script src="./bar.js"></script>
</body>
</html>`;

const inlineScriptHtmlBody = `
<html>
<body>
  <script type="module">
    class InlineClass {

    }
  </script>
  <script>console.log("x");</script>
</body>
</html>`;

describe('legacyPlugin - transform html', { timeout: 10000 }, () => {
  it(`does not do any work on a modern browser`, async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/index.html') {
              return htmlBody;
            }
          },
        },
        legacyPlugin(),
      ],
    });

    const text = await fetchText(`${host}/index.html`, {
      headers: { 'user-agent': modernUserAgents['Chrome 78'] },
    });

    assert.equal(text.trim(), htmlBody.trim());
    server.stop();
  });

  it(`injects polyfills into the HTML page on legacy browsers`, async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/index.html') {
              return htmlBody;
            }
          },
        },
        legacyPlugin(),
      ],
    });

    const text = await fetchText(`${host}/index.html`, {
      headers: { 'user-agent': legacyUserAgents['IE 11'] },
    });
    assertIncludes(text, 'function polyfillsLoader() {');
    assertIncludes(text, "loadScript('./polyfills/regenerator-runtime.");
    assertIncludes(text, "loadScript('./polyfills/fetch.");
    assertIncludes(text, "loadScript('./polyfills/systemjs.");
    server.stop();
  });

  it(`injects systemjs param to inline modules`, async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/index.html') {
              return htmlBody;
            }
          },
        },
        legacyPlugin(),
      ],
    });

    const text = await fetchText(`${host}/index.html`, {
      headers: { 'user-agent': legacyUserAgents['IE 11'] },
    });
    assertIncludes(text, "loadScript('./bar.js'");
    assertIncludes(text, "System.import('./foo.js?systemjs=true');");
    server.stop();
  });

  it(`handles inline scripts`, async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/index.html') {
              return inlineScriptHtmlBody;
            }
          },
        },
        legacyPlugin(),
      ],
    });

    const text = await fetchText(`${host}/index.html`, {
      headers: { 'user-agent': legacyUserAgents['IE 11'] },
    });
    assertIncludes(text, "loadScript('./inline-script-0.js?source=%2Findex.html'");
    assertIncludes(
      text,
      "System.import('./inline-script-1.js?source=%2Findex.html&systemjs=true');",
    );
    server.stop();
  });

  it(`can request inline scripts`, async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/index.html') {
              return inlineScriptHtmlBody;
            }
          },
        },
        legacyPlugin(),
      ],
    });

    await fetchText(`${host}/index.html`, {
      headers: { 'user-agent': legacyUserAgents['IE 11'] },
    });
    const text = await fetchText(`${host}/inline-script-1.js?source=%2Findex.html`, {
      headers: { 'user-agent': legacyUserAgents['IE 11'] },
    });
    assertIncludes(text, 'var InlineClass =');
    assertIncludes(text, '_classCallCheck(this, InlineClass);');
    server.stop();
  });

  it(`includes url parameters in inline script key`, async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.url === '/?foo=1') {
              return {
                body: '<html><body><script type="module">console.log("1");</script></body></html>',
                type: 'html',
              };
            }
            if (context.url === '/?foo=2') {
              return {
                body: '<html><body><script type="module">console.log("2");</script></body></html>',
                type: 'html',
              };
            }
          },
        },
        legacyPlugin(),
      ],
    });

    await fetchText(`${host}?foo=1`, {
      headers: { 'user-agent': legacyUserAgents['IE 11'] },
    });
    await fetchText(`${host}/?foo=2`, {
      headers: { 'user-agent': legacyUserAgents['IE 11'] },
    });
    const text1 = await fetchText(`${host}/inline-script-0.js?source=%2F%3Ffoo%3D1`, {
      headers: { 'user-agent': legacyUserAgents['IE 11'] },
    });
    const text2 = await fetchText(`${host}/inline-script-0.js?source=%2F%3Ffoo%3D2`, {
      headers: { 'user-agent': legacyUserAgents['IE 11'] },
    });
    assertIncludes(text1, 'console.log("1");');
    assertIncludes(text2, 'console.log("2");');
    server.stop();
  });
});
