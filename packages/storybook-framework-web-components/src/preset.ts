import type { PresetProperty } from '@storybook/types';
import type { StorybookConfig } from './types.js';

export const core: PresetProperty<'core', StorybookConfig> = {
  builder: '@web/storybook-builder',
  renderer: '@storybook/web-components',
};

export const wdsFinal: StorybookConfig['wdsFinal'] = wdsConfig => {
  return {
    ...wdsConfig,
    watch: true,
  };
};
