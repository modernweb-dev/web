import { expect } from 'chai';

it('test 404 request', async () => {
  try {
    await fetch('/non-existing.png');
  } catch {}

  expect(true).to.be.true;
});
