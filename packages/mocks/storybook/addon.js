// @ts-nocheck

import { createAddon } from '@web/storybook-prebuilt/create-addon.js';
import { React } from '@web/storybook-prebuilt/manager.js';
import { addons } from '@web/storybook-prebuilt/addons.js';
import { registerAddon } from './addon/register-addon.js';

// Storybook 6
registerAddon(addons, React, createAddon);
