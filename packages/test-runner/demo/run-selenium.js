const selenium = require('selenium-standalone');

console.log('installing...');

selenium.install(err => {
  if (err) {
    throw err;
  }
  console.log('finished installing, starting...');

  selenium.start((err, server) => {
    if (err) {
      throw err;
    }
    console.log('started');
  });
});
