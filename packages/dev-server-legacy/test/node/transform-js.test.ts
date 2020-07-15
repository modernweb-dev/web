import { expect } from 'chai';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { fetchText, expectIncludes } from '@web/dev-server-core/src/test-helpers';

import { legacyPlugin } from '../../src/legacyPlugin';
import { modernUserAgents, legacyUserAgents } from '../userAgents';

const modernCode = `
class Foo {

}

async function doImport() {
  await import('./xyz.js');
}

console.log(window?.foo?.bar);`;

describe('legacyPlugin()', () => {
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
      expectIncludes(text, 'System.register(');
      expectIncludes(text, 'function asyncGeneratorStep');
      expectIncludes(text, 'function _classCallCheck(instance');
      expectIncludes(text, '_asyncToGenerator');
      expectIncludes(text, "_context.import('./xyz.js');");
      expectIncludes(
        text,
        'console.log((_window = window) === null || _window === void 0 ? void 0 : (_window$foo = _window.foo) === null || _window$foo === void 0 ? void 0 : _window$foo.bar);',
      );
      server.stop();
    });
  }
});
