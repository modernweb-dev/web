import { emulateMedia } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

it('can emulate reduced motion', async () => {
  await emulateMedia({ reducedMotion: 'reduce' });
  expect(matchMedia('(prefers-reduced-motion: reduce)').matches).to.be.true;
  await emulateMedia({ reducedMotion: 'no-preference' });
  expect(matchMedia('(prefers-reduced-motion: no-preference)').matches).to.be.true;
});
