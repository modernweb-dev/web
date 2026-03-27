import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';

/** @type { import('../../../../index.d.ts').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.js', '../stories/**/*.mdx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@web/storybook-addon-mocks',
  ],
  framework: {
    name: '@web/storybook-framework-web-components',
  },
  rollupFinal(config) {
    return {
      ...config,
      plugins: [...config.plugins, importMetaAssets()],
      onLog(level, log, defaultHandler) {
        // we are only interested in warnings
        if (level !== 'warn') {
          defaultHandler(level, log);
          return;
        }

        // ignore circular dependency warnings in storybook internals
        if (log.code === 'CIRCULAR_DEPENDENCY') {
          const logIds = log.ids?.map(id => id?.replace(/\\/g, '/'));
          if (logIds?.some(id => id?.endsWith('node_modules/storybook/dist/csf/index.js'))) {
            defaultHandler('warn', log);
            return;
          }
        }

        // log all other warnings as errors
        defaultHandler('error', log);
      },
    };
  },
};
export default config;
