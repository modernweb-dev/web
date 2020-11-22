import { expect } from 'chai';
import { stubMethod } from 'hanbi';
import { createTestServer, expectIncludes } from '@web/dev-server-core/test-helpers';
import { Browser, launch as launchPuppeteer, Page } from 'puppeteer';
import { posix as pathUtil } from 'path';

import { hmrPlugin } from '../src/index';
import { mockFiles } from './utils';

function trackErrors(page: Page) {
  const errors: any[] = [];
  page.on('error', error => {
    errors.push(error);
  });
  page.on('console', e => {
    if (e.type() === 'error' || e.type() === 'warning') {
      errors.push(e.text());
    }
  });
  return errors;
}

describe('browser tests', function () {
  this.timeout(10000);

  let browser: Browser;

  before(async () => {
    browser = await launchPuppeteer();
  });

  after(async () => {
    await browser.close();
  });

  it('should bubble when bubbles is true', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        mockFiles({
          '/foo.html': '<script src="/foo.js" type="module"></script>',
          '/foo.js': `import '/bar.js'; import.meta.hot.accept();`,
          '/bar.js': `import.meta.hot.accept({ bubbles: true })`,
        }),
        hmrPlugin(),
      ],
    });
    const { fileWatcher, webSockets } = server;
    const stub = stubMethod(webSockets, 'send');
    const page = await browser.newPage();
    try {
      await page.goto(`${host}/foo.html`, { waitUntil: 'networkidle0' });
      fileWatcher.emit('change', pathUtil.join(__dirname, '/bar.js'));

      expect(stub.callCount).to.equal(2);
      expect(stub.getCall(0)!.args[0]).to.equal(
        JSON.stringify({
          type: 'hmr:update',
          url: '/bar.js',
        }),
      );
      expect(stub.getCall(1)!.args[0]).to.equal(
        JSON.stringify({
          type: 'hmr:update',
          url: '/foo.js',
        }),
      );
    } finally {
      await page.close();
      await server.stop();
    }
  });

  it('should hot replace a module', async () => {
    const files = {
      '/foo.html': '<script src="/foo.js" type="module"></script>',
      '/foo.js':
        'import.meta.hot.accept(); document.body.appendChild(document.createTextNode(" a "));',
    };
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [mockFiles(files), hmrPlugin()],
    });
    const page = await browser.newPage();
    const errors = trackErrors(page);

    try {
      await page.goto(`${host}/foo.html`, { waitUntil: 'networkidle0' });
      expectIncludes(await page.content(), '<body> a </body>');

      files['/foo.js'] = files['/foo.js'].replace('" a "', '" b "');
      server.fileWatcher.emit('change', pathUtil.join(__dirname, '/foo.js'));
      await page.waitForResponse(r => r.url().startsWith(`${host}/foo.js`));
      expectIncludes(await page.content(), '<body> a  b </body>');

      for (const error of errors) {
        throw error;
      }
    } finally {
      await page.close();
      await server.stop();
    }
  });

  it('should hot replace a bubbled module', async () => {
    const files = {
      '/foo.html': '<script src="/foo.js" type="module"></script>',
      '/foo.js':
        'import bar from "/bar.js"; import.meta.hot.accept(); document.body.appendChild(document.createTextNode(bar));',
      '/bar.js': 'export default " a ";',
    };
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [mockFiles(files), hmrPlugin()],
    });
    const page = await browser.newPage();
    const errors = trackErrors(page);

    try {
      await page.goto(`${host}/foo.html`, { waitUntil: 'networkidle0' });
      expectIncludes(await page.content(), '<body> a </body>');

      files['/bar.js'] = 'export default " b ";';
      server.fileWatcher.emit('change', pathUtil.join(__dirname, '/bar.js'));
      await page.waitForResponse(r => r.url().startsWith(`${host}/bar.js`));
      expectIncludes(await page.content(), '<body> a  b </body>');

      for (const error of errors) {
        throw error;
      }
    } finally {
      await page.close();
      await server.stop();
    }
  });

  it('hot replaces multiple bubbled modules', async () => {
    const files = {
      '/foo.html': '<script type="module">import "/foo.js"; import "/bar.js";</script>',
      '/foo.js':
        'import baz from "/baz.js"; import.meta.hot.accept(); document.body.appendChild(document.createTextNode(" foo " + baz));',
      '/bar.js':
        'import baz from "/baz.js"; import.meta.hot.accept(); document.body.appendChild(document.createTextNode(" bar " + baz));',
      '/baz.js': 'export default " a ";',
    };
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [mockFiles(files), hmrPlugin()],
    });
    const page = await browser.newPage();
    const errors = trackErrors(page);

    try {
      await page.goto(`${host}/foo.html`, { waitUntil: 'networkidle0' });
      // expectIncludes(await page.content(), '<body> foo  a  bar  a </body>');

      files['/baz.js'] = 'export default " b ";';
      server.fileWatcher.emit('change', pathUtil.join(__dirname, '/baz.js'));
      await Promise.all([
        page.waitForResponse(r => r.url().startsWith(`${host}/foo.js`)),
        page.waitForResponse(r => r.url().startsWith(`${host}/bar.js`)),
        page.waitForResponse(r => r.url().startsWith(`${host}/baz.js`)),
      ]);
      await new Promise(r => setTimeout(r, 1000));
      expectIncludes(await page.content(), '<body> foo  a  bar  a  foo  b  bar  b </body>');

      for (const error of errors) {
        throw error;
      }
    } finally {
      await page.close();
      await server.stop();
    }
  });

  it('reloads the page when a module has no hot replacable parent', async () => {
    const files = {
      '/foo.html':
        '<script src="/foo.js" type="module"></script><script src="/baz.js" type="module"></script>',
      '/foo.js':
        'import bar from "/bar.js"; import.meta.hot.accept(); document.body.appendChild(document.createTextNode(bar));',
      '/bar.js': 'export default " a ";',
      '/baz.js': 'document.body.appendChild(document.createTextNode(" b "));',
    };
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [mockFiles(files), hmrPlugin()],
    });
    const page = await browser.newPage();
    const errors = trackErrors(page);

    try {
      await page.goto(`${host}/foo.html`, { waitUntil: 'networkidle0' });
      await page.evaluate('document.body.appendChild(document.createTextNode(" c "))');
      expectIncludes(await page.content(), '<body> a  b  c </body>');

      server.fileWatcher.emit('change', pathUtil.join(__dirname, '/baz.js'));
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      expectIncludes(await page.content(), '<body> a  b </body>');

      for (const error of errors) {
        throw error;
      }
    } finally {
      await page.close();
      await server.stop();
    }
  });
});
