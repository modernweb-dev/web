import { expect } from 'chai';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { fetchText, expectIncludes } from '@web/dev-server-core/test-helpers';

import { legacyPlugin } from '../src/legacyPlugin.js';
import { modernUserAgents, legacyUserAgents } from './userAgents.js';

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

describe('legacyPlugin - transform html', function () {
  this.timeout(10000);

  it(`does not do any work on a modern browser`, async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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

    expect(text.trim()).to.equal(htmlBody.trim());
    server.stop();
  });

  it(`injects polyfills into the HTML page on legacy browsers`, async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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
    expectIncludes(text, 'function polyfillsLoader() {');
    expectIncludes(text, "loadScript('./polyfills/regenerator-runtime.");
    expectIncludes(text, "loadScript('./polyfills/fetch.");
    expectIncludes(text, "loadScript('./polyfills/systemjs.");
    server.stop();
  });

  it(`injects systemjs param to inline modules`, async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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
    expectIncludes(text, "loadScript('./bar.js'");
    expectIncludes(text, "System.import('./foo.js?systemjs=true');");
    server.stop();
  });

  it(`handles inline scripts`, async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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
    expectIncludes(text, "loadScript('./inline-script-0.js?source=%2Findex.html'");
    expectIncludes(
      text,
      "System.import('./inline-script-1.js?source=%2Findex.html&systemjs=true');",
    );
    server.stop();
  });

  it(`can request inline scripts`, async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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
    expectIncludes(text, 'var InlineClass =');
    expectIncludes(text, '_classCallCheck(this, InlineClass);');
    server.stop();
  });

  it(`includes url parameters in inline script key`, async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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
    expectIncludes(text1, 'console.log("1");');
    expectIncludes(text2, 'console.log("2");');
    server.stop();
  });
});
