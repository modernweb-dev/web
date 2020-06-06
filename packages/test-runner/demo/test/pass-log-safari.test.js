import { expect } from './chai.js';

it('test 1', () => {
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    console.log('message logged only on safari');
  }
  expect(true).to.be.true;
});
