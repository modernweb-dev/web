// @ts-nocheck

import { addons, makeDecorator } from '@storybook/preview-api';
import { createDecorator } from './create-decorator.js';

// Storybook 7+
/**
 * @type {ReturnType<typeof makeDecorator>}
 * @deprecated `@web/mocks` is deprecated and only supports up to Storybook 8. Please migrate to `@web/storybook-addon-mocks` for Storybook 9 support.
 **/
export const withMocks = createDecorator(addons, makeDecorator);
