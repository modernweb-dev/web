// @ts-nocheck

import { addons, makeDecorator } from '@storybook/preview-api';
import { createDecorator } from './create-decorator.js';

// Storybook 7
/**
 * @type {ReturnType<typeof makeDecorator>}
 */
export const withMocks = createDecorator(addons, makeDecorator);
