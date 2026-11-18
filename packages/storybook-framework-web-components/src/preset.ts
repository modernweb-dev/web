import { dirname, join } from 'node:path';
import type { PresetProperty } from 'storybook/internal/types';
import type { StorybookConfig } from './types.js';

const getAbsolutePath = <I extends string>(input: I): I =>
  dirname(require.resolve(join(input, 'package.json'))) as any;

const getEntryPath = <I extends string>(input: I): I => require.resolve(input) as any;

export const core: PresetProperty<'core', StorybookConfig> = {
  builder: getEntryPath('@web/storybook-builder'),
  renderer: getAbsolutePath('@storybook/web-components'),
};

export const wdsFinal: StorybookConfig['wdsFinal'] = wdsConfig => {
  return {
    ...wdsConfig,
    watch: true,
  };
};
