const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { patternsToFiles } = require('../src/patternsToFiles.js');

describe('patternsToFiles', () => {
  it('works with a string', async () => {
    const files = await patternsToFiles('*.svg', path.resolve(__dirname, './fixture/'));
    assert.equal(files.length, 2);
    assert.deepEqual(
      files.sort(),
      [path.join(__dirname, './fixture/a.svg'), path.join(__dirname, './fixture/b.svg')].sort(),
    );
  });

  it('works with an array of strings ', async () => {
    const files = await patternsToFiles(
      ['*.svg', 'sub/*.mark.svg'],
      path.resolve(__dirname, './fixture/'),
    );
    assert.equal(files.length, 3);
    assert.deepEqual(
      files.sort(),
      [
        path.join(__dirname, './fixture/a.svg'),
        path.join(__dirname, './fixture/b.svg'),
        path.join(__dirname, './fixture/sub/sub-b.mark.svg'),
      ].sort(),
    );
  });
});
