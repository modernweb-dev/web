import { saveSnapshot, getSnapshot, removeSnapshot } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

it('can save, read and remove snapshot a', async () => {
  const name = 'a';
  const content = 'this is snapshot A';
  const savedContent1 = await getSnapshot({ name });
  expect(savedContent1).to.equal(undefined);

  await saveSnapshot({ name, content });

  const savedContent2 = await getSnapshot({ name });
  expect(savedContent2).to.equal(content);

  await removeSnapshot({ name });
});

it('can save, read and remove snapshot b', async () => {
  const name = 'b';
  const content = 'this is snapshot B';
  await saveSnapshot({ name, content });

  const savedContent = await getSnapshot({ name });
  expect(content).to.equal(savedContent);

  await removeSnapshot({ name });
});

it('can save, read and remove multiple snapshots', async () => {
  const name1 = 'multi-1';
  const name2 = 'multi-2';
  const name3 = 'multi-3';
  const content1 = 'this is snapshot multi-1';
  const content2 = 'this is snapshot multi-2';
  const content3 = 'this is snapshot multi-3';
  await saveSnapshot({ name: name1, content: content1 });
  await saveSnapshot({ name: name2, content: content2 });
  await saveSnapshot({ name: name3, content: content3 });

  const savedContent1 = await getSnapshot({ name: name1 });
  const savedContent2 = await getSnapshot({ name: name2 });
  const savedContent3 = await getSnapshot({ name: name3 });
  expect(savedContent1).to.equal(content1);
  expect(savedContent2).to.equal(content2);
  expect(savedContent3).to.equal(content3);

  await removeSnapshot({ name: name1 });
  await removeSnapshot({ name: name2 });
  await removeSnapshot({ name: name3 });
});

it('can persist snapshot A between test runs', async () => {
  const name = 'persistent-a';
  const content = 'this is snapshot A';

  // the snapshot should be saved in a previous run, uncomment if the file
  // got deleted on disk
  // await saveSnapshot({ name, content });

  const savedContent = await getSnapshot({ name });
  expect(savedContent).to.equal(content);
});

it('can persist snapshot B between test runs', async () => {
  const name = 'persistent-b';
  const content = 'this is snapshot B';

  // the snapshot should be saved in a previous run, uncomment if the file
  // got deleted on disk
  // await saveSnapshot({ name, content });

  const savedContent = await getSnapshot({ name });
  expect(savedContent).to.equal(content);
});

it('can store multiline snapshots', async () => {
  const name = 'multiline';
  const content = `
a
b
c
`;
  await saveSnapshot({ name, content });

  const savedContent = await getSnapshot({ name });
  expect(savedContent).to.equal(content);

  await removeSnapshot({ name });
});
