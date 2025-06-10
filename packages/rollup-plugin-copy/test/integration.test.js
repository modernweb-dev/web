const path = require('path');
const { expect } = require('chai');
const rollup = require('rollup');

const { copy } = require('../src/copy.js');

describe('rollup-plugin-copy', () => {
  it('adds files to rollup', async () => {
    const bundle = await rollup.rollup({
      input: path.resolve(__dirname, './fixture/index.js'),
      plugins: [copy({ patterns: '**/*.svg', rootDir: path.resolve(__dirname, './fixture/') })],
    });
    const { output } = await bundle.generate({ format: 'es' });

    expect(output.length).to.equal(5);
    expect(output.map(x => x.fileName).filter(x => x.endsWith('.svg'))).to.have.members([
      'a.svg',
      'b.svg',
      `sub${path.sep}sub-a.svg`,
      `sub${path.sep}sub-b.mark.svg`,
    ]);
  });
});
