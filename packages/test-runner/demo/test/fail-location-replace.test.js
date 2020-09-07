window.location.replace('/new-page/');

it('x', async () => {
  await new Promise(r => setTimeout(r, 1000));
});
