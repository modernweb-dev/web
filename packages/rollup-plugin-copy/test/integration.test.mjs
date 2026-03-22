import path from 'path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { rollup } from 'rollup';

import { copy } from '../src/copy.js';

const __dirname = import.meta.dirname;

describe('rollup-plugin-copy', () => {
  it('adds files to rollup', async () => {
    const bundle = await rollup({
      input: path.resolve(__dirname, './fixture/index.js'),
      plugins: [copy({ patterns: '**/*.svg', rootDir: path.resolve(__dirname, './fixture/') })],
    });
    const { output } = await bundle.generate({ format: 'es' });

    assert.strictEqual(output.length, 5);
    const svgFiles = output.map(x => x.fileName).filter(x => x.endsWith('.svg')).sort();
    const expectedFiles = [
      'a.svg',
      'b.svg',
      `sub${path.sep}sub-a.svg`,
      `sub${path.sep}sub-b.mark.svg`,
    ].sort();
    assert.deepStrictEqual(svgFiles, expectedFiles);
  });
});
