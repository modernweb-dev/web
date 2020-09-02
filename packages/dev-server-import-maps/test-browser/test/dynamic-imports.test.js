it('it can import chai using a dynamic import', async () => {
  await import('chai/chai.js');

  if (typeof window.chai.expect !== 'function') {
    throw new Error('expect should be a function');
  }
});
