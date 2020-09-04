/* eslint-disable */
it('test a', async function () {
  this.timeout(5000);
  await new Promise(resolve => setTimeout(resolve, 100));
});

it('test b', async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});

it('test c', async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});
