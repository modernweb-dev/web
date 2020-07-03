/// <reference types="../../types/rollup__plugin-image" />
import image from '@rollup/plugin-image';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { rollupAdapter } from '../../src/rollupAdapter';

describe('@rollup/plugin-image', () => {
  it('can import images', async () => {
    const { server, host } = await createTestServer({
      plugins: [rollupAdapter(image())],
    });

    try {
      const text = await fetchText(`${host}/logo.png`);
      expectIncludes(text, 'const img = "data:image/png;base64,iVBORw0KGgoA');
      expectIncludes(text, 'export default img;');
    } finally {
      server.stop();
    }
  });
});
