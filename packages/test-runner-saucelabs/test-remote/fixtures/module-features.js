import { expect } from '../../../../node_modules/chai/chai.js';
import module from './module-features-a.js';

it('supports static imports', () => {
  expect(module).to.equal('moduleFeaturesA');
});

it('supports dynamic imports', async () => {
  const featuresB = (await import('./module-features-b.js')).default;
  expect(featuresB).to.equal('moduleFeaturesB');
});

it('supports import meta', () => {
  expect(import.meta.url.indexOf('fixtures/module-features.js')).to.not.equal(-1);
});
