import type { StorybookConfig as StorybookConfigBase } from '@storybook/types';
import type { BuilderOptions, StorybookConfigWds } from '@web/storybook-builder';

type FrameworkName = '@web/storybook-framework-web-components';
type BuilderName = '@web/storybook-builder';

export type FrameworkOptions = {
  builder?: BuilderOptions;
};

type StorybookConfigFramework = {
  framework:
    | FrameworkName
    | {
        name: FrameworkName;
        options: FrameworkOptions;
      };
  core?: StorybookConfigBase['core'] & {
    builder?:
      | BuilderName
      | {
          name: BuilderName;
          options: BuilderOptions;
        };
  };
};

/**
 * The interface for Storybook configuration in `main.ts` files.
 */
export type StorybookConfig = Omit<
  StorybookConfigBase,
  keyof StorybookConfigWds | keyof StorybookConfigFramework
> &
  StorybookConfigWds &
  StorybookConfigFramework;
