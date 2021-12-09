import selenium from 'selenium-standalone';

export async function startSeleniumServer(drivers: { [browser: string]: selenium.DriverOptions }) {
  let server: selenium.ChildProcess;

  try {
    await selenium.install({ drivers });
  } catch (err) {
    console.error('Error occurred when installing selenium.');
    throw err;
  }

  try {
    server = await selenium.start({ drivers });
  } catch (err) {
    console.error('Error occurred when starting selenium.');
    throw err;
  }

  return server;
}
