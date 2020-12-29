import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';

it('can run a test with focus c', async () => {
  const input = document.createElement('input');
  document.body.appendChild(input);

  let firedEvent = false;
  input.addEventListener('focus', () => {
    firedEvent = true;
  });
  input.focus();

  // await 2 frames for IE11
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  expect(firedEvent).to.be.true;
});
