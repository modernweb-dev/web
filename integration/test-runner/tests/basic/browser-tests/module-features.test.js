import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';
import module from './module-features-a.js';

it('supports static imports', () => {
  expect(module).to.equal('moduleFeaturesA');
});

it('supports dynamic imports', async () => {
  const featuresB = (await import('./module-features-b.js')).default;
  expect(featuresB).to.equal('moduleFeaturesB');
});

it('supports import meta', () => {
  expect(import.meta.url).to.include(
    'integration/test-runner/tests/basic/browser-tests/module-features.test.js',
  );
});
