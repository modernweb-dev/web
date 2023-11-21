import * as path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'node:url';

import { listFiles } from '../src/listFiles.js';

const dirname = fileURLToPath(new URL('.', import.meta.url));

describe('listFiles', () => {
  it('gives a list of files', async () => {
    const files = await listFiles('*.svg', path.resolve(dirname, './fixture/'));
    expect(files.length).to.equal(2);
    expect(files).to.have.members([
      path.join(__dirname, './fixture/a.svg'),
      path.join(__dirname, './fixture/b.svg'),
    ]);
  });

  it('only gives files and no folders', async () => {
    const files = await listFiles('**/*.svg', path.resolve(dirname, './fixture/'));
    expect(files.length).to.equal(4);
    expect(files).to.have.members([
      path.join(__dirname, './fixture/a.svg'),
      path.join(__dirname, './fixture/b.svg'),
      path.join(__dirname, './fixture/sub/sub-b.mark.svg'),
      path.join(__dirname, './fixture/sub/sub-a.svg'),
    ]);
  });

  it('will copy files inside dot folders', async () => {
    const files = await listFiles('**/*.svg', path.resolve(dirname, './fixtureDot/'));
    expect(files.length).to.equal(1);
    expect(files[0]).to.match(/fixtureDot(\/|\\)\.folder(\/|\\)inside-dot-folder\.svg$/);
  });
});
