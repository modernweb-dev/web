/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.js'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@web/storybook-framework-web-components',
  },
};
export default config;
