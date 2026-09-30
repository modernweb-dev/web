import { expect } from '../../../../node_modules/chai/index.js';
import { emulateMedia } from '../../browser/commands.mjs';

it('can emulate print media type', async () => {
  await emulateMedia({ media: 'print' });
  expect(matchMedia('print').matches).to.equal(true);
  await emulateMedia({ media: 'screen' });
  expect(matchMedia('screen').matches).to.equal(true);
});

it('can emulate color scheme', async () => {
  await emulateMedia({ colorScheme: 'dark' });
  expect(matchMedia('(prefers-color-scheme: dark)').matches).to.equal(true);
  await emulateMedia({ colorScheme: 'light' });
  expect(matchMedia('(prefers-color-scheme: light)').matches).to.equal(true);
});
