if (!sessionStorage.getItem('reloaded')) {
  sessionStorage.setItem('reloaded', 'true');
  setTimeout(() => {
    window.location.reload();
  }, 100);
} else {
  sessionStorage.removeItem('reloaded');
}

it('x', async function test() {
  this.timeout(10000);
  await new Promise(r => setTimeout(r, 5000));
});
