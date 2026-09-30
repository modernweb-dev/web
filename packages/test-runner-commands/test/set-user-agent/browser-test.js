import { expect } from '../../../../node_modules/chai/index.js';
import { setUserAgent } from '../../browser/commands.mjs';

it('can set the user agent', async () => {
  const userAgent = 'x';
  expect(navigator.userAgent).to.not.equal(userAgent);
  await setUserAgent(userAgent);
  expect(navigator.userAgent).to.equal(userAgent);
});
