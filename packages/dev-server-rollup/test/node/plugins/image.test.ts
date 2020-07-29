/// <reference types="../../../types/rollup__plugin-image" />
import rollupImage from '@rollup/plugin-image';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { fromRollup } from '../../../src/index';

const image = fromRollup(rollupImage);

describe('@rollup/plugin-image', () => {
  it('can import images', async () => {
    const { server, host } = await createTestServer({
      plugins: [image()],
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
