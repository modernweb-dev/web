const path = require('path');
const { expect } = require('chai');

const { listFiles } = require('../src/listFiles.js');

describe('listFiles', () => {
  it('gives a list of files', async () => {
    const files = await listFiles('*.svg', path.resolve('./test/fixture/'));
    expect(files.length).to.equal(2);
    expect(files[0]).to.match(/fixture\/a\.svg$/);
    expect(files[1]).to.match(/fixture\/b\.svg$/);
  });

  it('only gives files and no folders', async () => {
    const files = await listFiles('**/*.svg', path.resolve('./test/fixture/'));
    expect(files.length).to.equal(4);
    expect(files[0]).to.match(/fixture\/a\.svg$/);
    expect(files[1]).to.match(/fixture\/b\.svg$/);
    expect(files[2]).to.match(/fixture\/sub\/sub-a\.svg$/);
    expect(files[3]).to.match(/fixture\/sub\/sub-b\.mark\.svg$/);
  });
});
