import { setViewport, emulateMedia } from '@web/test-runner-commands';
import { expect } from './chai.js';

it('can resize to a small viewport', async () => {
  await setViewport({ height: 200, width: 100 });
  expect(window.innerHeight).to.equal(200);
  expect(window.innerWidth).to.equal(100);
});

it('can resize to a medium viewport', async () => {
  await setViewport({ height: 400, width: 200 });
  expect(window.innerHeight).to.equal(400);
  expect(window.innerWidth).to.equal(200);
});

it('can resize to a large viewport', async () => {
  await setViewport({ height: 1600, width: 1400 });
  expect(window.innerHeight).to.equal(1600);
  expect(window.innerWidth).to.equal(1400);
});

it('can emulate print media type', async () => {
  await emulateMedia({ media: 'print' });
  expect(matchMedia('print').matches).to.be.true;
  await emulateMedia({ media: 'screen' });
  expect(matchMedia('screen').matches).to.be.true;
});

it('can emulate color scheme', async () => {
  await emulateMedia({ colorScheme: 'dark' });
  expect(matchMedia('(prefers-color-scheme: dark)').matches).to.be.true;
  await emulateMedia({ colorScheme: 'light' });
  expect(matchMedia('(prefers-color-scheme: light)').matches).to.be.true;
  await emulateMedia({ colorScheme: 'no-preference' });
  expect(matchMedia('(prefers-color-scheme: no-preference)').matches).to.be.true;
});
