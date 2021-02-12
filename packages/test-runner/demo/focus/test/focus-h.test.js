import { expect } from '@esm-bundle/chai';

it('can run a test with focus h', async () => {
  const input = document.createElement('input');
  document.body.appendChild(input);

  let firedEvent = false;
  input.addEventListener('focus', () => {
    firedEvent = true;
  });
  input.focus();

  await Promise.resolve();
  expect(firedEvent).to.be.true;
});
