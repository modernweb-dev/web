// @ts-nocheck

import { addons, makeDecorator } from '@web/storybook-prebuilt/addons';
import { createDecorator } from './addon/create-decorator.js';

// Storybook 6

/**
 * @deprecated `@web/mocks` is deprecated and only supports up to Storybook 8. Please migrate to `@web/storybook-addon-mocks` for Storybook 9 support.
 **/
export const withMocks = createDecorator(addons, makeDecorator);
