import { expect } from 'chai';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { fetchText, expectIncludes, expectNotIncludes } from '@web/dev-server-core/test-helpers';

import { legacyPlugin } from '../src/legacyPlugin.js';
import { modernUserAgents, legacyUserAgents } from './userAgents.js';

const modernCode = `
class Foo {

}

async function doImport() {
  await import('./xyz.js');
}

console.log(window?.foo?.bar);`;

describe('legacyPlugin - transform js', function () {
  this.timeout(10000);

  for (const [name, userAgent] of Object.entries(modernUserAgents)) {
    it(`does not do any work on ${name}`, async () => {
      const { server, host } = await createTestServer({
        rootDir: __dirname,
        plugins: [
          {
            name: 'test',
            serve(context) {
              if (context.path === '/app.js') {
                return modernCode;
              }
            },
          },
          legacyPlugin(),
        ],
      });

      const text = await fetchText(`${host}/app.js`, {
        headers: { 'user-agent': userAgent },
      });
      expect(text.trim()).to.equal(modernCode.trim());
      server.stop();
    });
  }

  for (const [name, userAgent] of Object.entries(legacyUserAgents)) {
    it(`transforms to es5 on ${name}`, async () => {
      const { server, host } = await createTestServer({
        rootDir: __dirname,
        plugins: [
          {
            name: 'test',
            serve(context) {
              if (context.path === '/app.js') {
                return modernCode;
              }
            },
          },
          legacyPlugin(),
        ],
      });

      const text = await fetchText(`${host}/app.js`, {
        headers: { 'user-agent': userAgent },
      });
      expectNotIncludes(text, 'System.register(');
      expectIncludes(text, "import('./xyz.js?systemjs=true');");
      expectIncludes(text, 'function asyncGeneratorStep');
      expectIncludes(text, 'function _classCallCheck(instance');
      expectIncludes(text, '_asyncToGenerator');
      expectIncludes(
        text,
        'console.log((_window = window) === null || _window === void 0 || (_window = _window.foo) === null || _window === void 0 ? void 0 : _window.bar);',
      );
      server.stop();
    });

    it(`transforms to SystemJS when systemjs paramater is given ${name}`, async () => {
      const { server, host } = await createTestServer({
        rootDir: __dirname,
        plugins: [
          {
            name: 'test',
            serve(context) {
              if (context.path === '/app.js') {
                return modernCode;
              }
            },
          },
          legacyPlugin(),
        ],
      });

      const text = await fetchText(`${host}/app.js?systemjs=true`, {
        headers: { 'user-agent': userAgent },
      });
      expectIncludes(text, 'System.register(');
      expectIncludes(text, "_context.import('./xyz.js?systemjs=true');");
      expectIncludes(text, 'function asyncGeneratorStep');
      expectIncludes(text, 'function _classCallCheck(instance');
      expectIncludes(text, '_asyncToGenerator');
      expectIncludes(
        text,
        'console.log((_window = window) === null || _window === void 0 || (_window = _window.foo) === null || _window === void 0 ? void 0 : _window.bar);',
      );
      server.stop();
    });
  }
});
