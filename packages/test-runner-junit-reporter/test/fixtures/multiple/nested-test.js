import '../../../../../node_modules/chai/chai.js';

const inc = x => x + 1;
const compose2 = (f, g) => x => f(g(x));

describe('given a functor f', function() {
  describe('and a function a -> b', function() {
    describe('map f map g f a' , function() {
      it('is equivalent to map (f.g) f a', function () {
        const actual = [1].map(inc).map(inc)
        const expected = [1].map(compose2(inc, inc))
        chai.expect(actual).to.eql(expected)
      });
    })
  })
})