const {
  browserstackLauncher,
} = require('../dist/implementations/browser-launchers/browserstack-launcher');

module.exports = {
  browsers: [
    browserstackLauncher({
      project: 'wtr-demo',
      userAgents: [
        {
          browserName: 'chrome',
          os: 'windows',
          os_version: '10',
        },
        {
          browserName: 'firefox',
          os: 'windows',
          os_version: '10',
        },
        {
          browserName: 'edge',
          os: 'windows',
          os_version: '10',
        },
      ],
    }),
  ],
};
