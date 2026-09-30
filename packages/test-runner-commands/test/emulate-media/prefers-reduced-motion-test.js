import { expect } from '../../../../node_modules/chai/index.js';
import { emulateMedia } from '../../browser/commands.mjs';

it('can emulate reduced motion', async () => {
  await emulateMedia({ reducedMotion: 'reduce' });
  expect(matchMedia('(prefers-reduced-motion: reduce)').matches).to.equal(true);
  await emulateMedia({ reducedMotion: 'no-preference' });
  expect(matchMedia('(prefers-reduced-motion: no-preference)').matches).to.equal(true);
});
