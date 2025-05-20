import { expect } from './chai.js';
import './shared-a.js';

describe('Root suite test', () => {
  it('test 1', () => {
    expect(true).to.be.true;
  });

  it('test 2', () => {
    expect('foo').to.be.a('string');
  });

  describe('Nested suite test', () => {
    it('test 3', () => {
      expect(true).to.be.true;
    });

    it('test 4', () => {
      expect('foo').to.be.a('string');
    });

    describe('Nested suite test, level 2', () => {
      it('test 5', () => {
        expect(true).to.be.true;
      });
      it('test 6', () => {
        expect('foo').to.be.a('string');
      });
    });
  });
});
