describe('suite a', () => {
  it('test a 1', () => {});
  it('test a 2', () => {
    throw new Error('test a 2 error');
  });

  describe('suite b', () => {
    it('test b 1', () => {});
    it('test b 2', () => {});
  });
});

it('test 1', () => {});
it('test 2', () => {
  throw new Error('test 2 error');
});
