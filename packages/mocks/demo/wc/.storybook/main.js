/** @type { import('../../../../index.d.ts').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.js'],
  addons: ['@web/mocks/storybook-addon'],
  framework: {
    name: '@web/storybook-framework-web-components',
  },
};
export default config;
