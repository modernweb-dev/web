const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { listFiles } = require('../src/listFiles.js');

describe('listFiles', () => {
  it('gives a list of files', async () => {
    const files = await listFiles('*.svg', path.resolve(__dirname, './fixture/'));
    assert.equal(files.length, 2);
    assert.deepEqual(
      files.sort(),
      [path.join(__dirname, './fixture/a.svg'), path.join(__dirname, './fixture/b.svg')].sort(),
    );
  });

  it('only gives files and no folders', async () => {
    const files = await listFiles('**/*.svg', path.resolve(__dirname, './fixture/'));
    assert.equal(files.length, 4);
    assert.deepEqual(
      files.sort(),
      [
        path.join(__dirname, './fixture/a.svg'),
        path.join(__dirname, './fixture/b.svg'),
        path.join(__dirname, './fixture/sub/sub-b.mark.svg'),
        path.join(__dirname, './fixture/sub/sub-a.svg'),
      ].sort(),
    );
  });

  it('will copy files inside dot folders', async () => {
    const files = await listFiles('**/*.svg', path.resolve(__dirname, './fixtureDot/'));
    assert.equal(files.length, 1);
    assert.match(files[0], /fixtureDot(\/|\\)\.folder(\/|\\)inside-dot-folder\.svg$/);
  });
});
