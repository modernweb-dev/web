import { assert } from '../chai.js';

suite('my suite', () => {
  test('passes a', () => {
    assert.equal('foo', 'foo');
  });

  test('passes b', () => {
    assert.equal('foo', 'foo');
  });
});
