import { compareSnapshot, removeSnapshot } from '@web/test-runner-commands';

it('can test snapshot A', async () => {
  await compareSnapshot({ name: 'snapshot-a', content: 'some snapshot A1' });
});

it('can test snapshot B', async () => {
  await compareSnapshot({ name: 'snapshot-b', content: 'some snapshot B1' });
});

it('can test snapshot C', async () => {
  await compareSnapshot({ name: 'snapshot-c', content: 'some snapshot C1' });
});
