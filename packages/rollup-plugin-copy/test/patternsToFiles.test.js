import * as path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'node:url';

import { patternsToFiles } from '../src/patternsToFiles.js';

const dirname = fileURLToPath(new URL('.', import.meta.url));

describe('patternsToFiles', () => {
  it('works with a string', async () => {
    const files = await patternsToFiles('*.svg', path.resolve(dirname, './fixture/'));
    expect(files.length).to.equal(2);
    expect(files).to.have.members([
      path.join(__dirname, './fixture/a.svg'),
      path.join(__dirname, './fixture/b.svg'),
    ]);
  });

  it('works with an array of strings ', async () => {
    const files = await patternsToFiles(
      ['*.svg', 'sub/*.mark.svg'],
      path.resolve(dirname, './fixture/'),
    );
    expect(files.length).to.equal(3);
    expect(files).to.have.members([
      path.join(__dirname, './fixture/a.svg'),
      path.join(__dirname, './fixture/b.svg'),
      path.join(__dirname, './fixture/sub/sub-b.mark.svg'),
    ]);
  });
});
