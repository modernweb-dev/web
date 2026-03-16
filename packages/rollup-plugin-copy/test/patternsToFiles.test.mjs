import path from 'path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { patternsToFiles } from '../src/patternsToFiles.ts';

const __dirname = import.meta.dirname;

describe('patternsToFiles', () => {
  it('works with a string', async () => {
    const files = await patternsToFiles('*.svg', path.resolve(__dirname, './fixture/'));
    assert.strictEqual(files.length, 2);
    const expectedFiles = [
      path.join(__dirname, './fixture/a.svg'),
      path.join(__dirname, './fixture/b.svg'),
    ].sort();
    assert.deepStrictEqual(files.sort(), expectedFiles);
  });

  it('works with an array of strings ', async () => {
    const files = await patternsToFiles(
      ['*.svg', 'sub/*.mark.svg'],
      path.resolve(__dirname, './fixture/'),
    );
    assert.strictEqual(files.length, 3);
    const expectedFiles = [
      path.join(__dirname, './fixture/a.svg'),
      path.join(__dirname, './fixture/b.svg'),
      path.join(__dirname, './fixture/sub/sub-b.mark.svg'),
    ].sort();
    assert.deepStrictEqual(files.sort(), expectedFiles);
  });
});
