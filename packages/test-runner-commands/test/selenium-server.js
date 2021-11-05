import selenium from 'selenium-standalone';

export async function startSeleniumServer() {
  let server;

  try {
    await selenium.install({
      drivers: {
        chrome: { version: '94.0.4606.41' },
        firefox: { version: 'latest' },
      },
    });
  } catch (err) {
    console.error('Error occurred when installing selenium.');
    throw err;
  }

  try {
    server = await selenium.start({
      drivers: {
        chrome: { version: '94.0.4606.41' },
        firefox: { version: 'latest' },
      },
    });
  } catch (err) {
    console.error('Error occurred when starting selenium.');
    throw err;
  }

  return server;
}
