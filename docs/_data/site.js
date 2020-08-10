/* eslint-disable */
const { getRocketValues } = require('@d4kmor/cli');

const defaultValues = getRocketValues();

module.exports = {
  ...defaultValues,
  name: 'Modern Web',
  shortDesc: 'Guides, tools and libraries for modern web development.',
  url: defaultValues.url,
  socialLinks: [
    {
      name: 'GitHub',
      url: 'https://github.com/modernweb-dev/web',
    },
  ],
  helpUrl: 'https://github.com/modernweb-dev/web/issues',
  logoAlt: 'Tilted sphere with longitudinal stripes',
  iconColorMaskIcon: '#3f93ce',
  iconColorMsapplicationTileColor: '#1d3557',
  iconColorThemeColor: '#1d3557',
};
