import { getSnapshot } from '../../../browser/commands.mjs';
import { expect } from '../../chai.js';

it('can persist snapshot A between test runs', async () => {
  const name = 'persistent-a';
  const content = 'this is nested snapshot A';

  // the snapshot should be saved in a previous run, uncomment if the file
  // got deleted on disk
  // await saveSnapshot({ name, content });

  const savedContent = await getSnapshot({ name });
  expect(savedContent).to.equal(content);
});

it('can persist snapshot B between test runs', async () => {
  const name = 'persistent-b';
  const content = 'this is nested snapshot B';

  // the snapshot should be saved in a previous run, uncomment if the file
  // got deleted on disk
  // await saveSnapshot({ name, content });

  const savedContent = await getSnapshot({ name });
  expect(savedContent).to.equal(content);
});
