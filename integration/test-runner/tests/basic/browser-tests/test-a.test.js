it('test a', async function() {
  await new Promise(resolve => setTimeout(resolve, 100));
});

it('test b', async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});

it('test c', async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});
