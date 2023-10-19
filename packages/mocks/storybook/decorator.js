// @ts-nocheck

import { addons, makeDecorator } from '@web/storybook-prebuilt/addons';
import { createDecorator } from './addon/create-decorator.js';

// Storybook 6
export const withMocks = createDecorator(addons, makeDecorator);
