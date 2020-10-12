import { expect } from 'chai';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { fetchText, expectIncludes } from '@web/dev-server-core/test-helpers';

import { legacyPlugin } from '../src/legacyPlugin';
import { modernUserAgents, legacyUserAgents } from './userAgents';

const htmlBody = `
<html>
<body>
  <script type="module" src="./foo.js"></scrip>
</body>
</html>`;

const inlineScriptHtmlBody = `
<html>
<body>
  <script type="module">
    class InlineClass {

    }
  </script>
</body>
</html>`;

describe('legacyPlugin()', function () {
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
    expectIncludes(text, "System.import('./foo.js');");
    expectIncludes(text, "loadScript('./polyfills/systemjs.");
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
    expectIncludes(text, "System.import('./inline-script-0.js?source=%2Findex.html');");
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
    const text = await fetchText(`${host}/inline-script-0.js?source=%2Findex.html`, {
      headers: { 'user-agent': legacyUserAgents['IE 11'] },
    });
    expectIncludes(text, 'System.register');
    expectIncludes(text, 'var InlineClass;');
    expectIncludes(text, 'function _classCallCheck(instance');
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
