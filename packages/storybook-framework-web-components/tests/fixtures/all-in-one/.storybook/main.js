import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';

/** @type { import('../../../../index.d.ts').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.js', '../stories/**/*.mdx'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
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

        // ignore warning about eval in telejson
        if (log.code === 'EVAL' && log.id?.replace(/\\/g, '/')?.includes('node_modules/telejson')) {
          defaultHandler('warn', log);
          return;
        }

        // TODO: fix tocbot
        // ignore warning about tocbot
        if (
          log.code === 'MISSING_EXPORT' &&
          (log.binding === 'init' || log.binding === 'destroy') &&
          log.exporter?.includes('tocbot')
        ) {
          defaultHandler('warn', log);
          return;
        }

        // log all other warnings as errors
        defaultHandler('error', log);
      },
    };
  },
};
export default config;
