setTimeout(() => {
  window.location.href = 'https://www.example.org/';
}, 100);

it('x', async function test() {
  this.timeout(10000);
  await new Promise(r => setTimeout(r, 5000));
});
