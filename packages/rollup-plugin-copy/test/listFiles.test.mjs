import path from 'path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { listFiles } from '../src/listFiles.ts';

const __dirname = import.meta.dirname;

describe('listFiles', () => {
  it('gives a list of files', async () => {
    const files = await listFiles('*.svg', path.resolve(__dirname, './fixture/'));
    assert.strictEqual(files.length, 2);
    const expectedFiles = [
      path.join(__dirname, './fixture/a.svg'),
      path.join(__dirname, './fixture/b.svg'),
    ].sort();
    assert.deepStrictEqual(files.sort(), expectedFiles);
  });

  it('only gives files and no folders', async () => {
    const files = await listFiles('**/*.svg', path.resolve(__dirname, './fixture/'));
    assert.strictEqual(files.length, 4);
    const expectedFiles = [
      path.join(__dirname, './fixture/a.svg'),
      path.join(__dirname, './fixture/b.svg'),
      path.join(__dirname, './fixture/sub/sub-b.mark.svg'),
      path.join(__dirname, './fixture/sub/sub-a.svg'),
    ].sort();
    assert.deepStrictEqual(files.sort(), expectedFiles);
  });

  it('will copy files inside dot folders', async () => {
    const files = await listFiles('**/*.svg', path.resolve(__dirname, './fixtureDot/'));
    assert.strictEqual(files.length, 1);
    assert.match(files[0], /fixtureDot(\/|\\)\.folder(\/|\\)inside-dot-folder\.svg$/);
  });
});
