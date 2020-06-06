const {
  puppeteerLauncher,
} = require('../dist/implementations/browser-launchers/puppeteer-launcher');

module.exports = {
  browsers: [puppeteerLauncher({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })],
};
