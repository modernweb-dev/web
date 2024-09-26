// based on https://github.com/storybookjs/storybook/blob/v7.0.9/code/lib/builder-vite/src/codegen-set-addon-channel.ts

export async function generateSetupAddonsScript() {
  return `
import { createBrowserChannel } from '@storybook/core/channels';
import { addons } from '@storybook/preview-api';

const channel = createBrowserChannel({ page: 'preview' });
addons.setChannel(channel);
window.__STORYBOOK_ADDONS_CHANNEL__ = channel;
  `.trim();
}
