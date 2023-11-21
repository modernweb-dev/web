import * as path from 'path';
import { expect } from 'chai';
import * as rollup from 'rollup';
import { fileURLToPath } from 'node:url';

const dirname = fileURLToPath(new URL('.', import.meta.url));

import { copy } from '../src/copy.js';

describe('rollup-plugin-copy', () => {
  it('adds files to rollup', async () => {
    const bundle = await rollup.rollup({
      input: path.resolve(dirname, './fixture/index.js'),
      plugins: [copy({ patterns: '**/*.svg', rootDir: path.resolve(dirname, './fixture/') })],
    });
    const { output } = await bundle.generate({ format: 'es' });

    expect(output.length).to.equal(5);
    expect(output.map(x => x.fileName).filter(x => x.endsWith('.svg'))).to.have.members([
      'a.svg',
      'b.svg',
      'sub/sub-a.svg',
      'sub/sub-b.mark.svg',
    ]);
  });
});
