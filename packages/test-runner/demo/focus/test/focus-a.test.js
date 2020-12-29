import { expect } from '@esm-bundle/chai';

it('can run a test with focus a', async () => {
  const input = document.createElement('input');
  document.body.appendChild(input);

  let firedEvent = false;
  input.addEventListener('focus', () => {
    firedEvent = true;
  });
  input.focus();

  await new Promise(r => setTimeout(r, 100));
  expect(firedEvent).to.be.true;
});
