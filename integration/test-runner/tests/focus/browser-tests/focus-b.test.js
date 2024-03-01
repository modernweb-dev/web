import { expect } from '../../../../../node_modules/chai/chai.js';

it('can run a test with focus b', async () => {
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
