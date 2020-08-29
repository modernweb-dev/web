const path = require('path');
const { expect } = require('chai');

const { patternsToFiles } = require('../src/patternsToFiles.js');

describe('patternsToFiles', () => {
  it('works with a string', async () => {
    const files = await patternsToFiles('*.svg', path.resolve('./test/fixture/'));
    expect(files.length).to.equal(2);
    expect(files[0]).to.match(/fixture\/a\.svg$/);
    expect(files[1]).to.match(/fixture\/b\.svg$/);
  });

  it('works with an array of strings ', async () => {
    const files = await patternsToFiles(
      ['*.svg', 'sub/*.mark.svg'],
      path.resolve('./test/fixture/'),
    );
    expect(files.length).to.equal(3);
    expect(files[0]).to.match(/fixture\/a\.svg$/);
    expect(files[1]).to.match(/fixture\/b\.svg$/);
    expect(files[2]).to.match(/fixture\/sub\/sub-b\.mark\.svg$/);
  });
});
