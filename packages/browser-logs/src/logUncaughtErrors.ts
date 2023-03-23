window.addEventListener('error', e => {
  console.error(e.error);
});

window.addEventListener('unhandledrejection', e => {
  e.promise.catch(error => {
    console.error(
      'An error was thrown in a Promise outside a test. Did you forget to await a function or assertion?',
    );
    console.error(error);
  });
});
