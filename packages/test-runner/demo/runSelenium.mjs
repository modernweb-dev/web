import selenium from 'selenium-standalone';

console.log('Installing Selenium...');

export function runSelenium() {
  selenium.install(err => {
    if (err) {
      throw err;
    }
    console.log('Finished installing Selenium, starting...');

    selenium.start((err, server) => {
      if (err) {
        throw err;
      }
      console.log('Selenium started');
    });
  });
}
