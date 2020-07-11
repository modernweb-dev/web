import inject from '@rollup/plugin-inject';
import path from 'path';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { rollupAdapter } from '../../../src/rollupAdapter';

const injectedModulePath = path.join(__dirname, 'injected-module.js');

describe('@rollup/plugin-inject', () => {
  it('can resolve imports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return "const foo = typeof html === 'function' && SomeGlobal === 'global from injected import';";
            }
          },
        },
        rollupAdapter(
          inject({
            html: ['lit-html', 'html'],
            SomeGlobal: [injectedModulePath, 'SomeGlobal'],
          }),
        ),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      expectIncludes(text, "import { html as html } from 'lit-html';");
      expectIncludes(text, `import { SomeGlobal as SomeGlobal } from '${injectedModulePath}';`);
    } finally {
      server.stop();
    }
  });
});
