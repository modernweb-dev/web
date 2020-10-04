// window.location.href = '/foo/';
window.location.href = 'https://www.example.org/';

it('x', async function test() {
  this.timeout(20000);
  await new Promise(r => setTimeout(r, 10000));
});
