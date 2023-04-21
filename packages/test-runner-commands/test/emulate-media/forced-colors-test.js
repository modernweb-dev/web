import { emulateMedia } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

it('can emulate forced colors', async () => {
  await emulateMedia({ forcedColors: 'active' });
  expect(matchMedia('(forced-colors: active)').matches).to.be.true;
  await emulateMedia({ forcedColors: 'none' });
  expect(matchMedia('(forced-colors: none)').matches).to.be.true;
});
