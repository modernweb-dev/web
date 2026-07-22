if (!sessionStorage.getItem('reloaded')) {
  sessionStorage.setItem('reloaded', 'true');
  window.location.reload();
} else {
  sessionStorage.removeItem('reloaded');
}

it('x', async () => {
  await new Promise(r => setTimeout(r, 1000));
});
