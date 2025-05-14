// @ts-nocheck

import { createAddon } from '@web/storybook-utils';
import React from 'react';
import { addons, types } from '@storybook/manager-api';
import { registerAddon } from './register-addon.js';

// Storybook 7+
registerAddon(addons, types, React, createAddon);
