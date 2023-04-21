import selenium from 'selenium-standalone';

console.log('Installing Selenium...');

export async function runSelenium() {
  await selenium.install({
    drivers: {
      chrome: { version: 'latest' },
      firefox: { version: 'latest' },
    },
  });

  return await selenium.start({
    drivers: {
      chrome: { version: 'latest' },
      firefox: { version: 'latest' },
    },
  });
}
