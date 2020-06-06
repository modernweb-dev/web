const {
  playwrightLauncher,
} = require('../dist/implementations/browser-launchers/playwright-launcher');

module.exports = {
  browsers: [playwrightLauncher({ browserTypes: ['chromium', 'firefox', 'webkit'] })],
};
