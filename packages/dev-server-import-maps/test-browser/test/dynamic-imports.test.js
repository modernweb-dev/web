it('it can import chai using a dynamic import', async () => {
  const { expect } = await import('chai');

  if (typeof expect !== 'function') {
    throw new Error('expect should be a function');
  }
});
