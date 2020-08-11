import { setUserAgent } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

it('can set the user agent', async () => {
  const userAgent = 'x';
  expect(navigator.userAgent).to.not.equal(userAgent);
  await setUserAgent(userAgent);
  expect(navigator.userAgent).to.equal(userAgent);
});
