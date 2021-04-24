import { writeFile, readFile, removeFile } from '../../browser/commands.mjs';

it('can write and read a file', async () => {
  const path = 'hello-world.txt';
  await writeFile({ path, content: 'Hello world!' });
  const content = await readFile({ path });
  if (content !== 'Hello world!') {
    throw new Error('Content is not as expected');
  }
  await removeFile({ path });
});

it('can store a non-existing folder', async () => {
  const randomFolderName = Number.parseInt(Math.random() * 1000);
  const path = `${randomFolderName}/bar.json`;
  await writeFile({ path, content: 'Hello world!' });
  const content = await readFile({ path });
  if (content !== 'Hello world!') {
    throw new Error('Content is not as expected');
  }
  await removeFile({ path });
});

async function expectThrows(fn) {
  let thrown;
  try {
    await fn();
  } catch {
    thrown = true;
  }

  if (!thrown) {
    throw new Error('Should throw an error');
  }
}

it('throws when passing an absolute file path', async () => {
  await expectThrows(() => writeFile({ path: '/foo/bar.json', content: 'Hello world!' }));
  await expectThrows(() => readFile({ path: '/foo/bar.json' }));
  await expectThrows(() => removeFile({ path: '/foo/bar.json' }));
});
