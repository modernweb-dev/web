window.addEventListener('error', e => {
  console.error(e.error);
});

window.addEventListener('unhandledrejection', e => {
  e.promise.catch(error => {
    console.error(error);
  });
});
