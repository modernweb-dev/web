import { expect } from '../../../../node_modules/chai/index.js';
import { emulateMedia } from '../../browser/commands.mjs';

it('can emulate forced colors', async () => {
  await emulateMedia({ forcedColors: 'active' });
  expect(matchMedia('(forced-colors: active)').matches).to.equal(true);
  await emulateMedia({ forcedColors: 'none' });
  expect(matchMedia('(forced-colors: none)').matches).to.equal(true);
});
