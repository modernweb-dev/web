import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';

it('can run a test with focus e', async () => {
  const input = document.createElement('input');
  document.body.appendChild(input);

  console.log('firing event!')

  let firedEvent = false;
  input.addEventListener('focus', () => {
    console.log('event fired');
    firedEvent = true;
  });
  input.focus();
  
  console.log('focused!')

  // await 2 frames for IE11
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  
  console.log('awaited for animation frames!')

  await new Promise(resolve => {
    setTimeout(resolve, 300);
  })

  console.log(document.body, input);

  console.log(firedEvent);

  expect(firedEvent).to.be.true;
});
