import { dirname, join } from 'node:path';
import type { PresetProperty } from 'storybook/internal/types';
import type { StorybookConfig } from './types.js';

const getAbsolutePath = <I extends string>(input: I): I =>
  dirname(require.resolve(join(input, 'package.json'))) as any;

export const core: PresetProperty<'core', StorybookConfig> = {
  builder: getAbsolutePath('@web/storybook-builder'),
  renderer: getAbsolutePath('@storybook/web-components'),
};

export const wdsFinal: StorybookConfig['wdsFinal'] = wdsConfig => {
  return {
    ...wdsConfig,
    watch: true,
  };
};
