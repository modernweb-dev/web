import { setViewport } from '../../browser/commands.js';
import { expect } from '../chai.js';

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
