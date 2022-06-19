import { compareSnapshot } from '@web/test-runner-commands';

it('can test snapshot A', async () => {
  await compareSnapshot({ name: 'snapshot-a', content: 'some snapshot A4' });
});

it('can test snapshot B', async () => {
  await compareSnapshot({ name: 'snapshot-b', content: 'some snapshot B4' });
});

it('can test snapshot C', async () => {
  await compareSnapshot({ name: 'snapshot-c', content: 'some snapshot C4' });
});
